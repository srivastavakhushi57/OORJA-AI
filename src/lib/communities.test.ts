import { describe, it, expect } from 'vitest';
import { generateGeometricCommunities } from './communities';
import { DataCenter } from '../types';

describe('Community Engine Fallback Generator (/lib/communities.ts)', () => {
  const mockDc: DataCenter = {
    id: 'test-custom-dc',
    name: 'Rural AI Node',
    operator: 'GreenCompute',
    city: 'Jaipur',
    country: 'India',
    region: 'Asia Pacific',
    latitude: 26.9124,
    longitude: 75.7873,
    capacity_mw: 30,
    typical_utilization_pct: 70,
    pue: 1.25,
    cooling_type: 'liquid',
    status: 'operational',
    commissioning_year: 2024,
    approx_water_use_l_per_kwh: 0.2,
    renewable_share_pct: 80,
    grid_emission_factor_g_per_kwh: 650,
    data_quality: 'User-submitted',
    sources: [],
    last_updated: '2025-01-01',
  };

  it('generates at least 5 nearby settlements with valid coordinates and metrics', () => {
    const communities = generateGeometricCommunities(mockDc);

    expect(communities.length).toBeGreaterThanOrEqual(5);

    communities.forEach((c) => {
      expect(c.name).toContain('Jaipur');
      expect(c.distance_km).toBeGreaterThan(0);
      expect(c.distance_km).toBeLessThan(35);
      expect(c.population).toBeGreaterThan(100);
      expect(c.estimated_monthly_heat_demand_mwh).toBeGreaterThan(0);
      expect(c.suitability_score).toBeGreaterThanOrEqual(60);
      expect(['High', 'Medium', 'Challenging']).toContain(c.pipeline_feasibility);
    });
  });
});
