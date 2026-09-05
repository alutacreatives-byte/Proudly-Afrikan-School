import { SavedResource } from '../types';

const STORAGE_KEY = 'pas_saved_resources_v1';

export function getSavedResources(): SavedResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[Storage] Error reading saved resources:', err);
    return [];
  }
}

export function saveResourceToStorage(resource: SavedResource): void {
  try {
    const list = getSavedResources();
    const existingIndex = list.findIndex((item) => item.id === resource.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...resource };
    } else {
      list.unshift(resource);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('[Storage] Error saving resource:', err);
  }
}

export function deleteResourceFromStorage(id: string): void {
  try {
    const list = getSavedResources().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('[Storage] Error deleting resource:', err);
  }
}

export function clearAllSavedResources(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[Storage] Error clearing resources:', err);
  }
}
