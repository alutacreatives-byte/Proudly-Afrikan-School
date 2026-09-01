import { SavedResource } from '../types';

const STORAGE_KEY = 'proudly_afrikan_build_resources_v1';

export function getSavedResources(): SavedResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load saved resources from storage:', err);
    return [];
  }
}

export function saveResourceToStorage(resource: SavedResource): boolean {
  try {
    const existing = getSavedResources();
    const index = existing.findIndex((r) => r.id === resource.id);
    let updated: SavedResource[];

    if (index >= 0) {
      updated = [...existing];
      updated[index] = resource;
    } else {
      updated = [resource, ...existing];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to save resource to storage:', err);
    return false;
  }
}

export function deleteResourceFromStorage(id: string): boolean {
  try {
    const existing = getSavedResources();
    const filtered = existing.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete resource from storage:', err);
    return false;
  }
}

export function getResourceById(id: string): SavedResource | undefined {
  const existing = getSavedResources();
  return existing.find((r) => r.id === id);
}
