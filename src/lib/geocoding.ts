export interface GeocodingResult {
  placeId: number;
  displayName: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  country?: string;
  city?: string;
}

export async function searchNominatim(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const encoded = encodeURIComponent(query.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=5`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      return json.map((item: any) => ({
        placeId: item.place_id,
        displayName: item.display_name,
        name: item.name || item.display_name.split(',')[0],
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type,
        country: item.address?.country || 'Unknown',
        city: item.address?.city || item.address?.town || item.address?.county || item.address?.state || 'Unknown',
      }));
    }
  } catch (err) {
    console.warn('Nominatim geocoding failed or timed out:', err);
  }

  return [];
}
