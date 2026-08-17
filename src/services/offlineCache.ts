/**
 * MarketPulse Offline Cache & Low-Connectivity Resilience Engine
 * Designed for low-connectivity rural & urban market environments (e.g. Creek Road, Mile 3, Oil Mill).
 */

import { Product, Market, FieldSubmission } from '../types';

const OFFLINE_OUTBOX_KEY = 'marketpulse_offline_outbox_v1';
const CACHE_METADATA_KEY = 'marketpulse_cache_metadata_v1';

export interface PendingOfflineSubmission {
  id: string;
  clientTimestamp: number;
  data: {
    productId: string;
    productName: string;
    marketId: string;
    marketName: string;
    price: number;
    quantity: number;
    unit: string;
    sellerStall: string;
    photoUrl?: string;
  };
  retryCount: number;
  status: 'queued' | 'syncing' | 'failed';
}

export interface CacheMetadata {
  lastSyncTimestamp: number;
  cachedProductCount: number;
  cachedMarketCount: number;
  version: string;
}

/**
 * Retrieves all pending offline submissions waiting to sync
 */
export function getOfflineSubmissionsQueue(): PendingOfflineSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_OUTBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading offline queue:', e);
    return [];
  }
}

/**
 * Enqueues a price submission for synchronization when connectivity improves
 */
export function enqueueOfflineSubmission(data: PendingOfflineSubmission['data']): PendingOfflineSubmission {
  const queue = getOfflineSubmissionsQueue();
  const newSubmission: PendingOfflineSubmission = {
    id: `offline-sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    clientTimestamp: Date.now(),
    data,
    retryCount: 0,
    status: 'queued',
  };

  const updatedQueue = [...queue, newSubmission];
  try {
    localStorage.setItem(OFFLINE_OUTBOX_KEY, JSON.stringify(updatedQueue));
  } catch (e) {
    console.error('Failed to persist offline submission:', e);
  }

  return newSubmission;
}

/**
 * Removes an item from the offline sync queue
 */
export function removeOfflineSubmission(id: string): void {
  const queue = getOfflineSubmissionsQueue();
  const filtered = queue.filter((item) => item.id !== id);
  try {
    localStorage.setItem(OFFLINE_OUTBOX_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to update offline queue:', e);
  }
}

/**
 * Clears the entire offline sync queue
 */
export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(OFFLINE_OUTBOX_KEY);
  } catch (e) {
    console.error('Failed to clear offline queue:', e);
  }
}

/**
 * Saves cache synchronization metadata
 */
export function setCacheMetadata(productsCount: number, marketsCount: number): void {
  if (typeof window === 'undefined') return;
  const meta: CacheMetadata = {
    lastSyncTimestamp: Date.now(),
    cachedProductCount: productsCount,
    cachedMarketCount: marketsCount,
    version: '1.0.0',
  };
  try {
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(meta));
  } catch (e) {
    console.error('Failed to write cache metadata:', e);
  }
}

/**
 * Retrieves cache synchronization metadata
 */
export function getCacheMetadata(): CacheMetadata | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_METADATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Determines if the current network connection is slow or degraded
 */
export function isLowBandwidthConnection(): boolean {
  if (typeof window === 'undefined' || !navigator) return false;
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!conn) return false;

  if (conn.saveData === true) return true;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return true;
  if (conn.rtt && conn.rtt > 1500) return true; // High ping latency > 1.5s
  return false;
}
