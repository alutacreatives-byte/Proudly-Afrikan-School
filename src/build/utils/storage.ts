import { SavedResource } from '../types';

const STORAGE_KEY = 'proudly_afrikan_saved_build_resources_v2';

export function getSavedResources(): SavedResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load saved resources from storage:', e);
    return [];
  }
}

export function saveResourceToStorage(resource: SavedResource): void {
  try {
    const resources = getSavedResources();
    const existingIndex = resources.findIndex(r => r.id === resource.id);
    
    if (existingIndex >= 0) {
      resources[existingIndex] = { ...resource, createdAt: new Date().toISOString() };
    } else {
      resources.unshift({ ...resource, createdAt: new Date().toISOString() });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  } catch (e) {
    console.error('Failed to save resource to storage:', e);
  }
}

export function deleteResourceFromStorage(id: string): void {
  try {
    const resources = getSavedResources();
    const filtered = resources.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete resource from storage:', e);
  }
}

export function getResourceById(id: string): SavedResource | undefined {
  const resources = getSavedResources();
  return resources.find(r => r.id === id);
}

export function exportResourceAsJson(resource: SavedResource): void {
  try {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resource, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${resource.toolType}-${resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (e) {
    console.error('Failed to export resource as JSON:', e);
  }
}
