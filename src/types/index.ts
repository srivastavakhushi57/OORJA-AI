export type CoolingType = 'air' | 'hybrid' | 'liquid';
export type DCStatus = 'operational' | 'under construction' | 'planned';
export type DataQuality = 'Measured' | 'Estimated' | 'Dummy' | 'User-submitted';
export type Scenario = 'low' | 'base' | 'high';
export type CommunityType = 'village' | 'hamlet' | 'town' | 'suburb' | 'agricultural';
export type PipeFeasibility = 'High' | 'Medium' | 'Challenging';

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  latitude: number;
  longitude: number;
  distance_km: number;
  population: number;
  estimated_monthly_heat_demand_mwh: number;
  estimated_monthly_elec_demand_mwh: number;
  suitability_score: number; // 0 to 100
  landuse_types?: string[];
  pipeline_feasibility: PipeFeasibility;
  pipe_loss_pct: number;
  notes?: string;
}

export interface DataCenter {
  id: string;
  name: string;
  operator: string;
  city: string;
  state?: string;
  country: string;
  region: 'North America' | 'Europe' | 'Asia Pacific' | 'Latin America' | 'Middle East & Africa';
  latitude: number;
  longitude: number;
  capacity_mw: number; // Total facility electrical capacity
  typical_utilization_pct: number; // Default 50-85%
  pue: number; // Power Usage Effectiveness (1.05 - 1.8)
  cooling_type: CoolingType;
  cooling_supply_temp_c?: number; // Supply/return water temp
  status: DCStatus;
  commissioning_year: number;
  approx_water_use_l_per_kwh: number;
  renewable_share_pct: number;
  grid_emission_factor_g_per_kwh: number; // gCO2 / kWh
  data_quality: DataQuality;
  sources: string[];
  last_updated: string;
  description?: string;
  solar_potential_mw?: number;
  preseeded_communities?: Community[];
}

export interface EnergyAssumptions {
  month: number; // 1 to 12
  scenario: Scenario;
  utilization_pct: number; // 20 to 100
  pue: number; // 1.05 to 2.0
  heat_capture_pct: number; // 10 to 95
  orc_efficiency_pct: number; // 0 to 15 (0 for pure thermal reuse)
  heat_reuse_mode: 'direct_heat' | 'orc_power' | 'hybrid';
}

export interface DailyHeatBreakdown {
  day: number;
  recoverable_mwh: number;
  ambient_temp_c: number;
}

export interface EnergyCalculationResult {
  days_in_month: number;
  total_power_mw: number;
  it_power_mw: number;
  monthly_total_elec_mwh: number;
  monthly_it_elec_mwh: number;
  total_waste_heat_mwh: number;
  recoverable_heat_mwh: number;
  unrecoverable_heat_mwh: number;
  electricity_from_heat_mwh: number;
  net_delivered_thermal_mwh: number; // after average transmission losses
  daily_breakdown: DailyHeatBreakdown[];
  co2_avoided_tons: number;
  co2_avoided_diesel_tons: number;
  households_heat_met: number;
  households_elec_met: number;
  equivalent_trees: number;
  equivalent_cars_off_road: number;
  ambient_temp_c: number;
  cop_heat_pump_estimate: number;
  confidence_level: 'High' | 'Medium' | 'Preliminary';
}

export interface OtherDataCenterResult {
  id: string;
  name: string;
  operator: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  capacity_mw: number;
  cooling_type: CoolingType;
  pue: number;
  status: DCStatus;
}
