import { describe, it, expect } from 'vitest';
import { calculateEnergyRecovery, getScenarioAssumptions, estimateMonthlyAmbientTemp } from './energy';
import { calculateHaversineDistanceKm, getOtherDataCenters } from './nearbyDataCenters';
import { DataCenter } from '../types';

describe('Energy Calculation Engine (/lib/energy.ts)', () => {
  const mockDC: DataCenter = {
    id: 'test-dc-1',
    name: 'Test Data Center',
    operator: 'Hyperscale Inc',
    city: 'Mumbai',
    country: 'India',
    region: 'Asia Pacific',
    latitude: 19.076,
    longitude: 72.877,
    capacity_mw: 50,
    typical_utilization_pct: 70,
    pue: 1.25,
    cooling_type: 'liquid',
    status: 'operational',
    commissioning_year: 2023,
    approx_water_use_l_per_kwh: 0.5,
    renewable_share_pct: 60,
    grid_emission_factor_g_per_kwh: 700,
    data_quality: 'Measured',
    sources: ['https://example.com'],
    last_updated: '2025-01-01',
  };

  it('calculates IT power and waste heat accurately based on PUE and capacity', () => {
    const assumptions = {
      month: 1, // Jan = 31 days = 744 hours
      scenario: 'base' as const,
      utilization_pct: 70, // 50 * 0.70 = 35 MW total power
      pue: 1.25, // IT power = 35 / 1.25 = 28 MW
      heat_capture_pct: 80,
      orc_efficiency_pct: 0,
      heat_reuse_mode: 'direct_heat' as const,
    };

    const result = calculateEnergyRecovery(mockDC, assumptions);

    expect(result.days_in_month).toBe(31);
    expect(result.total_power_mw).toBe(35);
    expect(result.it_power_mw).toBe(28);

    // Monthly IT electricity = 28 MW * 744 h = 20,832 MWh
    expect(result.monthly_it_elec_mwh).toBe(20832);

    // Total waste heat = 20832 * 0.98 = 20,415.36 MWh
    expect(result.total_waste_heat_mwh).toBeCloseTo(20415.4, 0);

    // Recoverable heat (80% capture) = 20415.36 * 0.80 = 16,332.3 MWh
    expect(result.recoverable_heat_mwh).toBeCloseTo(16332.3, 0);

    // Unrecoverable heat = 20% = ~4,083 MWh
    expect(result.unrecoverable_heat_mwh).toBeCloseTo(4083, 0);

    // Electricity from heat is 0 when ORC is 0
    expect(result.electricity_from_heat_mwh).toBe(0);

    // Environmental metrics should be positive and realistic
    expect(result.co2_avoided_tons).toBeGreaterThan(1000);
    expect(result.households_heat_met).toBeGreaterThan(1000);
    expect(result.equivalent_trees).toBeGreaterThan(100000);
  });

  it('correctly calculates electricity generated when ORC is enabled', () => {
    const assumptions = {
      month: 1,
      scenario: 'base' as const,
      utilization_pct: 70,
      pue: 1.25,
      heat_capture_pct: 80,
      orc_efficiency_pct: 10, // 10% converted to power
      heat_reuse_mode: 'hybrid' as const,
    };

    const result = calculateEnergyRecovery(mockDC, assumptions);
    expect(result.electricity_from_heat_mwh).toBeGreaterThan(0);
    expect(result.recoverable_heat_mwh + result.electricity_from_heat_mwh).toBeCloseTo(
      result.total_waste_heat_mwh * 0.8,
      0
    );
  });

  it('adjusts presets according to Low, Base, High scenarios', () => {
    const low = getScenarioAssumptions('liquid', 'low', 70, 1.25);
    const high = getScenarioAssumptions('liquid', 'high', 70, 1.25);

    expect(low.utilization_pct).toBeLessThan(high.utilization_pct);
    expect(low.heat_capture_pct).toBeLessThan(high.heat_capture_pct);
    expect(low.pue).toBeGreaterThan(high.pue);
  });

  it('estimates seasonal ambient temperatures based on latitude and month', () => {
    // Helsinki (60 deg N) in Jan vs Jul
    const helsinkiJan = estimateMonthlyAmbientTemp(60.17, 0);
    const helsinkiJul = estimateMonthlyAmbientTemp(60.17, 6);
    expect(helsinkiJan).toBeLessThan(helsinkiJul);
  });
});

describe('Nearby Data Centers Engine (/lib/nearbyDataCenters.ts)', () => {
  it('computes accurate Haversine distance between London and Paris', () => {
    // London: 51.5074 N, 0.1278 W
    // Paris: 48.8566 N, 2.3522 E
    // Distance ~ 343 km
    const distance = calculateHaversineDistanceKm(51.5074, -0.1278, 48.8566, 2.3522);
    expect(distance).toBeGreaterThan(335);
    expect(distance).toBeLessThan(350);
  });

  it('sorts all other data centers strictly from nearest to farthest', () => {
    const target: DataCenter = {
      id: 'target',
      name: 'Target DC',
      operator: 'Op',
      city: 'Navi Mumbai',
      country: 'India',
      region: 'Asia Pacific',
      latitude: 19.033,
      longitude: 73.029,
      capacity_mw: 30,
      typical_utilization_pct: 70,
      pue: 1.3,
      cooling_type: 'hybrid',
      status: 'operational',
      commissioning_year: 2022,
      approx_water_use_l_per_kwh: 0.6,
      renewable_share_pct: 50,
      grid_emission_factor_g_per_kwh: 700,
      data_quality: 'Estimated',
      sources: [],
      last_updated: '2025-01-01',
    };

    const puneDC: DataCenter = {
      ...target,
      id: 'pune',
      name: 'Pune DC',
      city: 'Pune',
      latitude: 18.5204,
      longitude: 73.8567, // ~120 km from Navi Mumbai
    };

    const frankfurtDC: DataCenter = {
      ...target,
      id: 'frankfurt',
      name: 'Frankfurt DC',
      city: 'Frankfurt',
      country: 'Germany',
      latitude: 50.1109,
      longitude: 8.6821, // ~6,500 km away
    };

    const delhiDC: DataCenter = {
      ...target,
      id: 'delhi',
      name: 'Noida DC',
      city: 'Noida',
      latitude: 28.5355,
      longitude: 77.391, // ~1,150 km away
    };

    const all = [delhiDC, frankfurtDC, target, puneDC];
    const others = getOtherDataCenters(target, all);

    expect(others.length).toBe(3);
    expect(others[0].id).toBe('pune');
    expect(others[1].id).toBe('delhi');
    expect(others[2].id).toBe('frankfurt');
    expect(others[0].distance_km).toBeLessThan(others[1].distance_km);
    expect(others[1].distance_km).toBeLessThan(others[2].distance_km);
  });
});
