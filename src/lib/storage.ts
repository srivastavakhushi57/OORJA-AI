import initialDataCenters from '../data/datacenters.json';
import { DataCenter } from '../types';

const STORAGE_KEY = 'oorja_datacenters_v1';

export function getAllDataCenters(): DataCenter[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with seed data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDataCenters));
      return initialDataCenters as unknown as DataCenter[];
    }
    const parsed = JSON.parse(stored) as DataCenter[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialDataCenters as unknown as DataCenter[];
  } catch (err) {
    console.error('Error reading data centers from localStorage:', err);
    return initialDataCenters as unknown as DataCenter[];
  }
}

export function getDataCenterById(id: string): DataCenter | undefined {
  const all = getAllDataCenters();
  return all.find((dc) => dc.id === id);
}

export function saveDataCenter(dc: DataCenter): DataCenter[] {
  const current = getAllDataCenters();
  const index = current.findIndex((item) => item.id === dc.id);

  let updated: DataCenter[];
  if (index >= 0) {
    // Update existing
    updated = [...current];
    updated[index] = {
      ...dc,
      last_updated: new Date().toISOString().split('T')[0],
    };
  } else {
    // Add new
    const hasSource = dc.sources && dc.sources.length > 0 && dc.sources.some((s) => s.trim() !== '');
    const quality = dc.data_quality || (hasSource ? 'Estimated' : 'User-submitted');
    const newDc: DataCenter = {
      ...dc,
      id: dc.id || `custom-dc-${Date.now()}`,
      data_quality: quality,
      last_updated: new Date().toISOString().split('T')[0],
    };
    updated = [newDc, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }

  return updated;
}

export function resetToSeedData(): DataCenter[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDataCenters));
  } catch (err) {
    console.error('Failed to reset localStorage:', err);
  }
  return initialDataCenters as unknown as DataCenter[];
}
