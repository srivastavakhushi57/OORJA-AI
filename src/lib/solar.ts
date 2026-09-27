const SOLAR_CACHE_PREFIX = 'oorja_solar_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface SolarIrradianceData {
  annualAvgKwhM2Day: number;
  monthlyGhi: number[]; // 12 values
  estimatedRooftopPvCapacityMw: number;
  annualSolarGenerationMwh: number;
  source: 'nasa_power' | 'regional_model';
}

/**
 * Fetch solar irradiance from NASA POWER API or calculate with regional model
 */
export async function getSolarPotential(
  latitude: number,
  longitude: number,
  facilityCapacityMw: number
): Promise<SolarIrradianceData> {
  const cacheKey = `${SOLAR_CACHE_PREFIX}${latitude.toFixed(2)}_${longitude.toFixed(2)}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS && data) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Solar cache read error:', err);
  }

  // NASA POWER Climatology endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${longitude}&latitude=${latitude}&format=JSON`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const params = json.properties?.parameter?.ALLSKY_SFC_SW_DWN;
      if (params) {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const monthlyGhi = months.map((m) => Number((params[m] || 4.5).toFixed(2)));
        const annualAvg = Number((params.ANN || 4.8).toFixed(2));

        // Estimate rooftop PV: typical hyperscale DC has ~15,000 to 40,000 m² roof
        // ~10% of facility capacity in MWp rooftop solar
        const rooftopPvMw = Number(Math.max(1.0, Math.min(15.0, facilityCapacityMw * 0.08)).toFixed(1));
        const annualGenMwh = Math.round(rooftopPvMw * annualAvg * 365 * 0.78); // PR 0.78

        const result: SolarIrradianceData = {
          annualAvgKwhM2Day: annualAvg,
          monthlyGhi,
          estimatedRooftopPvCapacityMw: rooftopPvMw,
          annualSolarGenerationMwh: annualGenMwh,
          source: 'nasa_power',
        };

        try {
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
        } catch (e) {
          console.warn('Solar cache write failed:', e);
        }

        return result;
      }
    }
  } catch (err) {
    console.warn('NASA POWER API failed, using regional solar model:', err);
  }

  // Regional baseline fallback
  // Solar irradiance higher near equator (~5.5 kWh/m²/day), lower at poles (~2.5 kWh/m²/day)
  const absLat = Math.abs(latitude);
  const baseGhi = Math.max(2.5, 6.0 - (absLat / 70) * 3.2);
  const monthlyGhi = Array.from({ length: 12 }, (_, i) => {
    const angle = ((i - 5.5) / 12) * 2 * Math.PI;
    const variation = latitude >= 0 ? Math.cos(angle) * 1.4 : -Math.cos(angle) * 1.4;
    return Number(Math.max(1.5, baseGhi + variation).toFixed(2));
  });

  const rooftopPvMw = Number(Math.max(1.0, Math.min(15.0, facilityCapacityMw * 0.08)).toFixed(1));
  const annualGenMwh = Math.round(rooftopPvMw * baseGhi * 365 * 0.78);

  return {
    annualAvgKwhM2Day: Number(baseGhi.toFixed(2)),
    monthlyGhi,
    estimatedRooftopPvCapacityMw: rooftopPvMw,
    annualSolarGenerationMwh: annualGenMwh,
    source: 'regional_model',
  };
}
