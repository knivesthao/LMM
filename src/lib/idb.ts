const DB_NAME = 'lmm-content';
const STORE_NAME = 'scenes';
const DB_VERSION = 1;

interface SceneEntry {
  contentId: string;
  sceneNumber: number;
  html: string;
  url: string;
  downloadedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: ['contentId', 'sceneNumber'],
        });
        store.createIndex('contentId', 'contentId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeScene(
  contentId: string,
  sceneNumber: number,
  html: string,
  url: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ contentId, sceneNumber, html, url, downloadedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    db.close();
  });
}

export async function getScene(
  contentId: string,
  sceneNumber: number
): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get([contentId, sceneNumber]);
    request.onsuccess = () =>
      resolve(request.result ? (request.result as SceneEntry).html : null);
    request.onerror = () => reject(request.error);
    db.close();
  });
}

export async function isSceneDownloaded(
  contentId: string,
  sceneNumber: number
): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getKey([contentId, sceneNumber]);
    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);
    db.close();
  });
}

export async function getDownloadedScenes(
  contentId: string
): Promise<number[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('contentId');
    const request = index.getAllKeys(contentId);
    request.onsuccess = () =>
      resolve(
        (request.result as [string, number][]).map(([, n]) => n)
      );
    request.onerror = () => reject(request.error);
    db.close();
  });
}

export async function removeContent(contentId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('contentId');
    const request = index.getAllKeys(contentId);
    request.onsuccess = () => {
      for (const key of request.result) {
        store.delete(key);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    db.close();
  });
}
