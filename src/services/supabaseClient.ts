import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://iqavukfmeahqnovrkcuo.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_5RovDlCqQdsibyqQDVo2BA_7uRCmAoO';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const rawSupabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

function normalizeSupabaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '');
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co')) {
      throw new Error('Supabase URL must be an https://*.supabase.co project URL');
    }
    return url.origin;
  } catch (error) {
    console.error('Invalid Supabase URL configuration', error);
    return '';
  }
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const supabasePublishableKey = rawSupabaseKey.trim();
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabasePublishableKey) return null;
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabasePublishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
export function getSupabasePublicConfig(): { url: string; publishableKey: string } | null {
  if (!supabaseUrl || !supabasePublishableKey) return null;
  return { url: supabaseUrl, publishableKey: supabasePublishableKey };
}

const STORAGE_PREFIX = 'marketpulse_';
export function getLocalData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage for key: ${key}`, e);
    return fallback;
  }
}

export function setLocalData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('marketpulse_sync');
      channel.postMessage({ key, timestamp: Date.now() });
      channel.close();
    }
  } catch (e) {
    console.warn(`Error setting localStorage for key: ${key}`, e);
  }
}
