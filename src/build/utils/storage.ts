import { SavedResource } from '../types';

const STORAGE_KEY = 'proudly_afrikan_saved_resources_v1';

export function getSavedResources(): SavedResource[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load saved resources:', e);
    return [];
  }
}

export function saveResourceToStorage(resource: SavedResource): void {
  try {
    const existing = getSavedResources();
    const filtered = existing.filter(r => r.id !== resource.id);
    const updated = [resource, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save resource:', e);
  }
}

export function deleteResourceFromStorage(id: string): void {
  try {
    const existing = getSavedResources();
    const updated = existing.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete resource:', e);
  }
}
