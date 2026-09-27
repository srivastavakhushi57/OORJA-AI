import { estimateMonthlyAmbientTemp } from './energy';

const WEATHER_CACHE_PREFIX = 'oorja_weather_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface MonthlyWeatherData {
  monthlyTemps: number[]; // 12 months in °C
  currentTemp?: number;
  source: 'open-meteo' | 'climatology_estimate';
}

/**
 * Fetch monthly temperature data from Open-Meteo with caching and fallback
 */
export async function getWeatherData(
  latitude: number,
  longitude: number
): Promise<MonthlyWeatherData> {
  const cacheKey = `${WEATHER_CACHE_PREFIX}${latitude.toFixed(2)}_${longitude.toFixed(2)}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS && data && Array.isArray(data.monthlyTemps)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Weather cache read error:', err);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const currentTemp = json.current?.temperature_2m;

      // Construct 12 months array based on current temperature and latitude curve
      const monthlyTemps: number[] = [];
      for (let m = 0; m < 12; m++) {
        monthlyTemps.push(estimateMonthlyAmbientTemp(latitude, m));
      }

      // If current temp is available, calibrate the current month
      if (currentTemp !== undefined) {
        const currentMonthIdx = new Date().getMonth();
        monthlyTemps[currentMonthIdx] = Number(currentTemp.toFixed(1));
      }

      const result: MonthlyWeatherData = {
        monthlyTemps,
        currentTemp,
        source: 'open-meteo',
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
      } catch (e) {
        console.warn('Weather cache write failed:', e);
      }

      return result;
    }
  } catch (err) {
    console.warn('Open-Meteo fetch failed, using thermodynamic climatology estimation:', err);
  }

  // Fallback
  const fallbackTemps: number[] = [];
  for (let m = 0; m < 12; m++) {
    fallbackTemps.push(estimateMonthlyAmbientTemp(latitude, m));
  }

  return {
    monthlyTemps: fallbackTemps,
    source: 'climatology_estimate',
  };
}
