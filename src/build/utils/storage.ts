import { SavedResource } from '../types';

const STORAGE_KEY_BUILD_RESOURCES = 'proudly_afrikan_build_resources_v1';

export function getSavedResources(): SavedResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUILD_RESOURCES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved resources:', e);
    return [];
  }
}

export function saveResourceToStorage(resource: SavedResource): void {
  try {
    const existing = getSavedResources();
    const index = existing.findIndex(r => r.id === resource.id);
    if (index >= 0) {
      existing[index] = resource;
    } else {
      existing.unshift(resource);
    }
    localStorage.setItem(STORAGE_KEY_BUILD_RESOURCES, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save resource:', e);
  }
}

export function deleteResourceFromStorage(id: string): void {
  try {
    const existing = getSavedResources();
    const filtered = existing.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY_BUILD_RESOURCES, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete resource:', e);
  }
}
