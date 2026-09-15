import { SavedResource } from '../types';

const STORAGE_KEY = 'proudly_afrikan_build_resources_v1';

export function getSavedResources(): SavedResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading saved resources:', e);
    return [];
  }
}

export function saveResourceToStorage(resource: SavedResource): void {
  try {
    const current = getSavedResources();
    const existingIndex = current.findIndex(r => r.id === resource.id);
    let updated: SavedResource[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...resource, createdAt: new Date().toISOString() };
    } else {
      updated = [resource, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving resource:', e);
  }
}

export function deleteResourceFromStorage(id: string): void {
  try {
    const current = getSavedResources();
    const updated = current.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting resource:', e);
  }
}
