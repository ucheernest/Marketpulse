import { DeviceLocation } from '../types';

const DB_NAME = 'marketpulse-offline';
const DB_VERSION = 2;
const OUTBOX_STORE = 'price-observations';
const CACHE_METADATA_KEY = 'marketpulse_cache_metadata_v2';

export interface PendingOfflineSubmission {
  id: string;
  /** Supabase auth user that captured this observation. Never sync under another account. */
  ownerUserId: string;
  clientTimestamp: number;
  data: {
    productId: string;
    productName: string;
    marketId: string;
    marketName: string;
    price: number;
    unit: string;
    sellerStall: string;
    location: DeviceLocation;
    evidenceBlob: Blob;
    evidenceMimeType: string;
  };
  retryCount: number;
  status: 'queued' | 'syncing' | 'failed';
  lastError?: string;
}

export interface CacheMetadata {
  lastSyncTimestamp: number;
  cachedProductCount: number;
  cachedMarketCount: number;
  version: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, { keyPath: 'id' });
      } else if ((event.oldVersion || 0) < 2 && request.transaction) {
        request.transaction.objectStore(OUTBOX_STORE).clear();
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open offline database.'));
  });
}

async function withStore<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, mode);
    const request = work(tx.objectStore(OUTBOX_STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Offline storage request failed.'));
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Offline storage transaction failed.'));
    };
  });
}

export async function getOfflineSubmissionsQueue(ownerUserId?: string | null): Promise<PendingOfflineSubmission[]> {
  if (!ownerUserId) return [];
  try {
    const rows = await withStore<PendingOfflineSubmission[]>('readonly', (store) => store.getAll());
    return (rows || [])
      .filter((row) => row.ownerUserId === ownerUserId)
      .sort((a, b) => a.clientTimestamp - b.clientTimestamp);
  } catch (error) {
    console.warn('Unable to read offline submission queue:', error);
    return [];
  }
}

export async function enqueueOfflineSubmission(ownerUserId: string, data: PendingOfflineSubmission['data']): Promise<PendingOfflineSubmission> {
  if (!ownerUserId) throw new Error('An authenticated field-agent identity is required for offline capture.');
  const item: PendingOfflineSubmission = {
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ownerUserId,
    clientTimestamp: Date.now(),
    data,
    retryCount: 0,
    status: 'queued',
  };
  await withStore<IDBValidKey>('readwrite', (store) => store.add(item));
  return item;
}

export async function updateOfflineSubmission(item: PendingOfflineSubmission): Promise<void> {
  await withStore<IDBValidKey>('readwrite', (store) => store.put(item));
}

export async function removeOfflineSubmission(id: string): Promise<void> {
  await withStore<undefined>('readwrite', (store) => store.delete(id) as IDBRequest<undefined>);
}

export async function clearOfflineQueue(): Promise<void> {
  await withStore<undefined>('readwrite', (store) => store.clear() as IDBRequest<undefined>);
}

export function setCacheMetadata(productsCount: number, marketsCount: number): void {
  if (typeof window === 'undefined') return;
  const meta: CacheMetadata = {
    lastSyncTimestamp: Date.now(),
    cachedProductCount: productsCount,
    cachedMarketCount: marketsCount,
    version: '2.1.0',
  };
  try {
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(meta));
  } catch (error) {
    console.warn('Unable to persist cache metadata:', error);
  }
}

export function getCacheMetadata(): CacheMetadata | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_METADATA_KEY);
    return raw ? (JSON.parse(raw) as CacheMetadata) : null;
  } catch {
    return null;
  }
}

export function isLowBandwidthConnection(): boolean {
  if (typeof window === 'undefined') return false;
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!conn) return false;
  return conn.saveData === true || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || (conn.rtt && conn.rtt > 1500);
}
