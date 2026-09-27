import { Community, CommunityType, DataCenter, PipeFeasibility } from '../types';
import { calculateHaversineDistanceKm } from './nearbyDataCenters';

const OVERPASS_CACHE_PREFIX = 'oorja_overpass_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface OverpassElement {
  type: 'node' | 'way';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    place?: string;
    landuse?: string;
    population?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Fetch nearby communities from Overpass API (with 24h caching and automatic fallback to seed data)
 */
export async function getNearbyCommunities(
  dataCenter: DataCenter,
  radiusKm = 25
): Promise<{ communities: Community[]; source: 'live_overpass' | 'cached_overpass' | 'seed_data' }> {
  const cacheKey = `${OVERPASS_CACHE_PREFIX}${dataCenter.id}_${radiusKm}`;

  // Check 24-hour cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS && Array.isArray(data) && data.length >= 3) {
        return { communities: data, source: 'cached_overpass' };
      }
    }
  } catch (err) {
    console.warn('Could not read overpass cache:', err);
  }

  // Attempt live Overpass query
  try {
    const radiusMeters = Math.min(35000, radiusKm * 1000);
    const lat = dataCenter.latitude;
    const lon = dataCenter.longitude;

    // Overpass query for places & agricultural landuse
    const query = `[out:json][timeout:7];
(
  node["place"~"village|hamlet|town|suburb"](around:${radiusMeters},${lat},${lon});
  way["landuse"~"farmland|greenhouse"](around:${radiusMeters},${lat},${lon});
);
out center 40;`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const json: OverpassResponse = await response.json();
      const parsed = processOverpassElements(json.elements, dataCenter);

      if (parsed.length >= 3) {
        // Cache valid result
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ timestamp: Date.now(), data: parsed })
          );
        } catch (e) {
          console.warn('Failed to cache overpass response:', e);
        }
        return { communities: parsed, source: 'live_overpass' };
      }
    }
  } catch (err) {
    console.warn('Overpass API call failed or timed out, falling back to seed data:', err);
  }

  // Fallback: use preseeded communities
  if (dataCenter.preseeded_communities && dataCenter.preseeded_communities.length > 0) {
    return { communities: dataCenter.preseeded_communities, source: 'seed_data' };
  }

  // Fallback for custom added DCs: generate geometrically realistic nearby settlements
  const fallbackGenerated = generateGeometricCommunities(dataCenter);
  return { communities: fallbackGenerated, source: 'seed_data' };
}

/**
 * Process and rank raw Overpass elements
 */
function processOverpassElements(elements: OverpassElement[], dc: DataCenter): Community[] {
  const placeElements = elements.filter(
    (el) => el.tags && el.tags.name && el.tags.place && ['village', 'hamlet', 'town', 'suburb'].includes(el.tags.place)
  );

  const agriculturalZones = elements.filter(
    (el) => el.tags && el.tags.landuse && ['farmland', 'greenhouse'].includes(el.tags.landuse)
  );

  const results: Community[] = [];
  const seenNames = new Set<string>();

  for (const el of placeElements) {
    const name = el.tags?.name?.trim();
    if (!name || seenNames.has(name.toLowerCase())) continue;
    seenNames.add(name.toLowerCase());

    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat === undefined || lon === undefined) continue;

    const distance = calculateHaversineDistanceKm(dc.latitude, dc.longitude, lat, lon);
    const placeType = (el.tags?.place as CommunityType) || 'village';

    // Estimate population
    let pop = 3000;
    if (el.tags?.population && !isNaN(parseInt(el.tags.population))) {
      pop = parseInt(el.tags.population);
    } else {
      switch (placeType) {
        case 'hamlet':
          pop = 450 + Math.floor(Math.sin(distance * 3) * 200 + 200);
          break;
        case 'village':
          pop = 4500 + Math.floor(Math.sin(distance * 5) * 2000 + 2000);
          break;
        case 'suburb':
          pop = 15000 + Math.floor(Math.sin(distance * 2) * 5000 + 5000);
          break;
        case 'town':
          pop = 24000 + Math.floor(Math.sin(distance * 4) * 8000 + 8000);
          break;
      }
    }

    // Check proximity to agricultural zones
    const hasNearbyFarmland = agriculturalZones.some((ag) => {
      const agLat = ag.lat ?? ag.center?.lat;
      const agLon = ag.lon ?? ag.center?.lon;
      if (agLat === undefined || agLon === undefined) return false;
      return calculateHaversineDistanceKm(lat, lon, agLat, agLon) < 3.0;
    });

    const landuseTypes: string[] = ['residential'];
    if (hasNearbyFarmland) landuseTypes.push('farmland', 'greenhouse');

    // Feasibility and losses
    let feasibility: PipeFeasibility = 'High';
    let pipeLoss = 2.0 + distance * 0.5;
    if (distance > 18) {
      feasibility = 'Challenging';
      pipeLoss = 12.0 + (distance - 18) * 0.6;
    } else if (distance > 8) {
      feasibility = 'Medium';
      pipeLoss = 6.0 + (distance - 8) * 0.55;
    }
    pipeLoss = Number(Math.min(22, pipeLoss).toFixed(1));

    // Heat & electricity demand
    const monthlyHeatMwh = Math.round((pop * 0.12 * (1 + (dc.latitude > 40 ? 0.3 : 0))));
    const monthlyElecMwh = Math.round((pop * 0.28));

    // Suitability score (0 - 100)
    // Distance decay: closer is vastly better
    const distComponent = Math.max(10, 100 - distance * 2.8);
    // Land use bonus for agricultural heat sink
    const landuseBonus = hasNearbyFarmland ? 6 : 0;
    // Feasibility bonus
    const feasBonus = feasibility === 'High' ? 8 : feasibility === 'Medium' ? 4 : 0;

    const suitabilityScore = Math.min(99, Math.round(distComponent * 0.8 + landuseBonus + feasBonus));

    results.push({
      id: `overpass-${el.id}`,
      name,
      type: placeType,
      latitude: lat,
      longitude: lon,
      distance_km: distance,
      population: pop,
      estimated_monthly_heat_demand_mwh: monthlyHeatMwh,
      estimated_monthly_elec_demand_mwh: monthlyElecMwh,
      suitability_score: suitabilityScore,
      landuse_types: landuseTypes,
      pipeline_feasibility: feasibility,
      pipe_loss_pct: pipeLoss,
      notes: `Identified via OpenStreetMap. ${hasNearbyFarmland ? 'Proximity to agricultural land offers direct low-temp thermal sink.' : 'Residential district heating network candidate.'}`,
    });
  }

  // Sort by suitability score descending
  results.sort((a, b) => b.suitability_score - a.suitability_score);

  return results.slice(0, 10);
}

/**
 * Fallback generator for custom data centers without seed communities
 */
export function generateGeometricCommunities(dc: DataCenter): Community[] {
  const directions = [
    { name: 'North Village', dLat: 0.035, dLon: 0.015, type: 'village' as CommunityType, pop: 4200 },
    { name: 'East Agri-Hamlet', dLat: -0.012, dLon: 0.048, type: 'hamlet' as CommunityType, pop: 1800 },
    { name: 'South Suburban District', dLat: -0.042, dLon: -0.018, type: 'suburb' as CommunityType, pop: 16500 },
    { name: 'West Green Settlement', dLat: 0.018, dLon: -0.052, type: 'village' as CommunityType, pop: 6800 },
    { name: 'Northeast Market Town', dLat: 0.065, dLon: 0.062, type: 'town' as CommunityType, pop: 22000 },
  ];

  return directions.map((dir, i) => {
    const lat = Number((dc.latitude + dir.dLat).toFixed(4));
    const lon = Number((dc.longitude + dir.dLon).toFixed(4));
    const distance = calculateHaversineDistanceKm(dc.latitude, dc.longitude, lat, lon);

    const feasibility: PipeFeasibility = distance < 8 ? 'High' : distance < 18 ? 'Medium' : 'Challenging';
    const pipeLoss = Number((2.5 + distance * 0.45).toFixed(1));
    const heatMwh = Math.round(dir.pop * 0.14);
    const elecMwh = Math.round(dir.pop * 0.3);
    const suitability = Math.max(65, Math.round(100 - distance * 2.5));

    return {
      id: `synth-${dc.id}-${i}`,
      name: `${dc.city} ${dir.name}`,
      type: dir.type,
      latitude: lat,
      longitude: lon,
      distance_km: distance,
      population: dir.pop,
      estimated_monthly_heat_demand_mwh: heatMwh,
      estimated_monthly_elec_demand_mwh: elecMwh,
      suitability_score: suitability,
      landuse_types: ['residential', 'farmland'],
      pipeline_feasibility: feasibility,
      pipe_loss_pct: pipeLoss,
      notes: 'Local municipal settlement candidate for district thermal piping network.',
    };
  });
}
