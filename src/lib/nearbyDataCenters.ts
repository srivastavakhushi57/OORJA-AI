import { DataCenter, OtherDataCenterResult } from '../types';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Number(distance.toFixed(1));
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Given a target data center and a list of all data centers:
 * 1. Computes Haversine distance to every other data center (no maximum radius).
 * 2. Excludes the target data center itself.
 * 3. Sorts results strictly from nearest to farthest.
 * 4. Returns an array with: id, name, operator, city, country, latitude, longitude, distance_km, capacity_mw, cooling_type, pue, status.
 */
export function getOtherDataCenters(
  target: Pick<DataCenter, 'id' | 'latitude' | 'longitude'>,
  allDataCenters: DataCenter[]
): OtherDataCenterResult[] {
  if (!allDataCenters || allDataCenters.length <= 1) {
    return [];
  }

  const results: OtherDataCenterResult[] = [];

  for (const dc of allDataCenters) {
    if (dc.id === target.id) continue;

    const distance = calculateHaversineDistanceKm(
      target.latitude,
      target.longitude,
      dc.latitude,
      dc.longitude
    );

    results.push({
      id: dc.id,
      name: dc.name,
      operator: dc.operator,
      city: dc.city,
      country: dc.country,
      latitude: dc.latitude,
      longitude: dc.longitude,
      distance_km: distance,
      capacity_mw: dc.capacity_mw,
      cooling_type: dc.cooling_type,
      pue: dc.pue,
      status: dc.status,
    });
  }

  // Sort nearest to farthest
  results.sort((a, b) => a.distance_km - b.distance_km);

  return results;
}
