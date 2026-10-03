import { SavedResource } from '../types';

const STORAGE_KEY = 'ai_studio_build_resources_v1';

export const BuildStorage = {
  getResources(): SavedResource[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveResource(resource: SavedResource): void {
    const items = BuildStorage.getResources();
    const existingIdx = items.findIndex(i => i.id === resource.id);
    if (existingIdx >= 0) {
      items[existingIdx] = resource;
    } else {
      items.unshift(resource);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },
  deleteResource(id: string): void {
    const items = BuildStorage.getResources().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export function saveResourceToStorage(resource: SavedResource): void {
  BuildStorage.saveResource(resource);
}

export function getSavedResources(): SavedResource[] {
  return BuildStorage.getResources();
}

export function deleteResourceFromStorage(id: string): void {
  BuildStorage.deleteResource(id);
}
