import { SavedResource } from '../types';

const STORAGE_KEY_BUILD_RESOURCES = 'proudly_afrikan_build_resources';

export function getSavedResources(): SavedResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUILD_RESOURCES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load build resources from localStorage', err);
    return [];
  }
}

export function saveResourceToStorage(resource: SavedResource): SavedResource[] {
  try {
    const current = getSavedResources();
    const existingIndex = current.findIndex((r) => r.id === resource.id);
    let updated: SavedResource[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = {
        ...resource,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updated = [resource, ...current];
    }

    localStorage.setItem(STORAGE_KEY_BUILD_RESOURCES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save build resource to localStorage', err);
    return getSavedResources();
  }
}

export function deleteResourceFromStorage(id: string): SavedResource[] {
  try {
    const current = getSavedResources();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY_BUILD_RESOURCES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete build resource from localStorage', err);
    return getSavedResources();
  }
}

export function toggleFavoriteResource(id: string): SavedResource[] {
  try {
    const current = getSavedResources();
    const updated = current.map((r) => {
      if (r.id === id) {
        return { ...r, isFavorite: !r.isFavorite, updatedAt: new Date().toISOString() };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY_BUILD_RESOURCES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to toggle favorite on build resource', err);
    return getSavedResources();
  }
}

export function getResourceById(id: string): SavedResource | null {
  const current = getSavedResources();
  return current.find((r) => r.id === id) || null;
}
