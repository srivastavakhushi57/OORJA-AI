import {
  CoolingType,
  DataCenter,
  DailyHeatBreakdown,
  EnergyAssumptions,
  EnergyCalculationResult,
  Scenario,
} from '../types';

export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_NAMES_HI = [
  'जनवरी',
  'फ़रवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितंबर',
  'अक्टूबर',
  'नवंबर',
  'दिसंबर',
];

/**
 * Default presets for Low / Base / High scenarios by cooling type
 */
export function getScenarioAssumptions(
  coolingType: CoolingType,
  scenario: Scenario,
  baseUtilization = 70,
  basePue = 1.25
): Pick<EnergyAssumptions, 'utilization_pct' | 'pue' | 'heat_capture_pct' | 'orc_efficiency_pct'> {
  let capture = 65;
  if (coolingType === 'liquid') capture = 80;
  if (coolingType === 'air') capture = 40;

  switch (scenario) {
    case 'low':
      return {
        utilization_pct: Math.max(35, Math.round(baseUtilization * 0.75)),
        pue: Number((basePue * 1.1).toFixed(2)),
        heat_capture_pct: Math.max(20, Math.round(capture * 0.65)),
        orc_efficiency_pct: 0,
      };
    case 'high':
      return {
        utilization_pct: Math.min(95, Math.round(baseUtilization * 1.2)),
        pue: Number(Math.max(1.06, basePue * 0.95).toFixed(2)),
        heat_capture_pct: Math.min(92, Math.round(capture * 1.2)),
        orc_efficiency_pct: coolingType === 'liquid' ? 8 : 4,
      };
    case 'base':
    default:
      return {
        utilization_pct: baseUtilization,
        pue: basePue,
        heat_capture_pct: capture,
        orc_efficiency_pct: coolingType === 'liquid' ? 5 : 0,
      };
  }
}

/**
 * Estimate ambient temperature for a given month and latitude
 */
export function estimateMonthlyAmbientTemp(latitude: number, monthIndex: number): number {
  // Northern hemisphere winter in Dec-Feb, summer in Jun-Aug
  // Southern hemisphere inverted
  const isNorthern = latitude >= 0;
  const absLat = Math.min(75, Math.abs(latitude));
  
  // Base equatorial temp ~28C, polar temp ~ -15C
  const baseTemp = 28 - (absLat / 75) * 40;
  
  // Seasonal amplitude increases with latitude
  const seasonalAmp = (absLat / 75) * 18;
  
  // Angle: month 0 is January (peak cold in north, peak heat in south)
  const angle = ((monthIndex - 0.5) / 12) * 2 * Math.PI;
  const seasonalMod = isNorthern ? -Math.cos(angle) : Math.cos(angle);
  
  const estimatedTemp = baseTemp + seasonalAmp * seasonalMod;
  return Number(estimatedTemp.toFixed(1));
}

/**
 * Primary Energy Recovery Calculation Engine
 */
export function calculateEnergyRecovery(
  dataCenter: Pick<
    DataCenter,
    'capacity_mw' | 'grid_emission_factor_g_per_kwh' | 'latitude' | 'cooling_type' | 'data_quality'
  >,
  assumptions: EnergyAssumptions,
  externalAmbientTemp?: number
): EnergyCalculationResult {
  const monthIdx = Math.max(0, Math.min(11, assumptions.month - 1));
  const daysInMonth = DAYS_IN_MONTH[monthIdx];
  const hoursInMonth = daysInMonth * 24;

  const ambientTemp =
    externalAmbientTemp !== undefined
      ? externalAmbientTemp
      : estimateMonthlyAmbientTemp(dataCenter.latitude, monthIdx);

  // 1. Power breakdown
  // Capacity represents total connected facility IT + support load
  // IT power = Total Power / PUE
  const pue = Math.max(1.02, assumptions.pue);
  const utilization = Math.max(10, Math.min(100, assumptions.utilization_pct)) / 100;
  
  const totalPowerMw = dataCenter.capacity_mw * utilization;
  const itPowerMw = totalPowerMw / pue;

  // Monthly electricity consumption (MWh)
  const monthlyTotalElecMwh = totalPowerMw * hoursInMonth;
  const monthlyItElecMwh = itPowerMw * hoursInMonth;

  // 2. Waste heat generation
  // ~98% of IT electrical input turns directly into thermal energy
  const totalWasteHeatMwh = monthlyItElecMwh * 0.98;

  // 3. Recoverable heat
  const capturePct = Math.max(5, Math.min(95, assumptions.heat_capture_pct)) / 100;
  const grossRecoverableHeatMwh = totalWasteHeatMwh * capturePct;

  // 4. Optional electricity via ORC (Organic Rankine Cycle)
  const orcPct = Math.max(0, Math.min(20, assumptions.orc_efficiency_pct)) / 100;
  const electricityFromHeatMwh = grossRecoverableHeatMwh * orcPct;
  const recoverableHeatMwh = grossRecoverableHeatMwh - electricityFromHeatMwh;
  const unrecoverableHeatMwh = Math.max(0, totalWasteHeatMwh - grossRecoverableHeatMwh);

  // Thermal distribution pipe losses (typical 6% for 5-10km insulated district pipes)
  const pipeLossFactor = 0.94;
  const netDeliveredThermalMwh = recoverableHeatMwh * pipeLossFactor;

  // 5. Daily heat generation breakdown with weather variance
  const dailyBreakdown: DailyHeatBreakdown[] = [];
  const baseDailyGross = grossRecoverableHeatMwh / daysInMonth;

  for (let d = 1; d <= daysInMonth; d++) {
    // slight diurnal / stochastic noise (+/- 4%)
    const noise = Math.sin((d * 7) / Math.PI) * 0.04;
    const dailyTemp = Number((ambientTemp + Math.sin(d / 2) * 2).toFixed(1));
    const dayRecoverable = Number((baseDailyGross * (1 + noise)).toFixed(2));
    dailyBreakdown.push({
      day: d,
      recoverable_mwh: dayRecoverable,
      ambient_temp_c: dailyTemp,
    });
  }

  // 6. Environmental Impact Calculations
  // Avoided emissions against local grid (tCO2 = MWh * gCO2/kWh / 1000)
  const gridFactor = dataCenter.grid_emission_factor_g_per_kwh || 500;
  // Displacing electric heating (assuming baseline COP 2.5 heat pump) + electricity recovered
  const heatPumpCop = 2.8;
  const displacedGridElecMwh = (recoverableHeatMwh / heatPumpCop) + electricityFromHeatMwh;
  const co2AvoidedTons = (displacedGridElecMwh * gridFactor) / 1000;

  // Avoided emissions against direct diesel heating (approx 0.27 tCO2/MWh thermal)
  const dieselEmissionFactor = 0.27; // tCO2 per thermal MWh
  const co2AvoidedDieselTons = recoverableHeatMwh * dieselEmissionFactor;

  // 7. Household Equivalence
  // Cold climate monthly household heating: ~800 kWh thermal (0.8 MWh)
  // Mild climate domestic hot water / space: ~450 kWh thermal (0.45 MWh)
  const avgHouseholdHeatDemandMwh = ambientTemp < 15 ? 0.8 : 0.45;
  const householdsHeatMet = Math.floor(netDeliveredThermalMwh / avgHouseholdHeatDemandMwh);

  // Monthly household electricity consumption: ~300 kWh (0.3 MWh)
  const householdsElecMet = Math.floor(electricityFromHeatMwh / 0.3);

  // Trees equivalence: ~21.77 kg CO2/year/tree => ~1.814 kg/month = 0.001814 tons/month
  const equivalentTrees = Math.floor(co2AvoidedTons / 0.001814);

  // Cars equivalence: ~4.6 tons CO2/year/car => ~0.3833 tons/month
  const equivalentCarsOffRoad = Math.floor(co2AvoidedTons / 0.3833);

  // Heat pump COP for district heating boost (Carnot estimate: COP = T_hot / (T_hot - T_source))
  const tSource = dataCenter.cooling_type === 'liquid' ? 55 : dataCenter.cooling_type === 'hybrid' ? 40 : 30;
  const tDistrict = 70; // 70°C supply
  const carnotCop = (tDistrict + 273.15) / ((tDistrict + 273.15) - (tSource + 273.15));
  const realisticCop = Number(Math.max(2.5, Math.min(6.5, carnotCop * 0.5)).toFixed(2));

  let confidenceLevel: 'High' | 'Medium' | 'Preliminary' = 'Medium';
  if (dataCenter.data_quality === 'Measured') {
    confidenceLevel = 'High';
  } else if (dataCenter.data_quality === 'Dummy' || dataCenter.data_quality === 'User-submitted') {
    confidenceLevel = 'Preliminary';
  }

  return {
    days_in_month: daysInMonth,
    total_power_mw: Number(totalPowerMw.toFixed(2)),
    it_power_mw: Number(itPowerMw.toFixed(2)),
    monthly_total_elec_mwh: Number(monthlyTotalElecMwh.toFixed(1)),
    monthly_it_elec_mwh: Number(monthlyItElecMwh.toFixed(1)),
    total_waste_heat_mwh: Number(totalWasteHeatMwh.toFixed(1)),
    recoverable_heat_mwh: Number(recoverableHeatMwh.toFixed(1)),
    unrecoverable_heat_mwh: Number(unrecoverableHeatMwh.toFixed(1)),
    electricity_from_heat_mwh: Number(electricityFromHeatMwh.toFixed(1)),
    net_delivered_thermal_mwh: Number(netDeliveredThermalMwh.toFixed(1)),
    daily_breakdown: dailyBreakdown,
    co2_avoided_tons: Number(co2AvoidedTons.toFixed(1)),
    co2_avoided_diesel_tons: Number(co2AvoidedDieselTons.toFixed(1)),
    households_heat_met: householdsHeatMet,
    households_elec_met: householdsElecMet,
    equivalent_trees: equivalentTrees,
    equivalent_cars_off_road: equivalentCarsOffRoad,
    ambient_temp_c: ambientTemp,
    cop_heat_pump_estimate: realisticCop,
    confidence_level: confidenceLevel,
  };
}
