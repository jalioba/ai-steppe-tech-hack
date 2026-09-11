/**
 * IndexedDB storage utility for persisting audio file and transcription state across page refreshes.
 */

const DB_NAME = 'AIMeetingAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'current_audio';
const RECORD_KEY = 'active_session';

export interface StoredSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface StoredAudioData {
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
  duration?: number;
  segments?: StoredSegment[];
  statusMessage?: string;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save audio file and its metadata to IndexedDB
 */
export async function saveStoredAudio(
  file: File,
  meta?: {
    duration?: number;
    segments?: StoredSegment[];
    statusMessage?: string;
  }
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredAudioData = {
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'audio/mpeg',
      duration: meta?.duration || 0,
      segments: meta?.segments || [],
      statusMessage: meta?.statusMessage || '',
      updatedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const putRequest = store.put(record, RECORD_KEY);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
  } catch (err) {
    console.error('Failed to save audio to IndexedDB:', err);
  }
}

/**
 * Retrieve the active audio file and state from IndexedDB
 */
export async function getStoredAudio(): Promise<StoredAudioData | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(RECORD_KEY);
      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (err) {
    console.warn('Failed to retrieve audio from IndexedDB:', err);
    return null;
  }
}

/**
 * Update segments and status without re-uploading file
 */
export async function updateStoredAudioSegments(
  segments: StoredSegment[],
  statusMessage?: string,
  duration?: number
): Promise<void> {
  try {
    const existing = await getStoredAudio();
    if (!existing || !existing.file) return;

    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const updated: StoredAudioData = {
      ...existing,
      segments,
      statusMessage: statusMessage !== undefined ? statusMessage : existing.statusMessage,
      duration: duration !== undefined ? duration : existing.duration,
      updatedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const putRequest = store.put(updated, RECORD_KEY);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
  } catch (err) {
    console.error('Failed to update segments in IndexedDB:', err);
  }
}

/**
 * Clear stored audio data completely
 */
export async function clearStoredAudio(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const delRequest = store.delete(RECORD_KEY);
      delRequest.onsuccess = () => resolve();
      delRequest.onerror = () => reject(delRequest.error);
    });
  } catch (err) {
    console.error('Failed to clear audio from IndexedDB:', err);
  }
}
