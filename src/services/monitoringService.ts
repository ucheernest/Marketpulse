import { getSupabase } from './supabaseClient';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0';
let installed = false;
let logging = false;

function normalizeError(error: unknown): { name: string; message: string; stack: string | null } {
  if (error instanceof Error) {
    return {
      name: error.name || 'Error',
      message: error.message || 'Unknown client error',
      stack: error.stack || null,
    };
  }
  if (typeof error === 'string') return { name: 'Error', message: error, stack: null };
  try {
    return { name: 'Error', message: JSON.stringify(error), stack: null };
  } catch {
    return { name: 'Error', message: 'Unknown client error', stack: null };
  }
}

export async function logClientError(error: unknown, source = 'runtime'): Promise<void> {
  if (logging) return;
  const supabase = getSupabase();
  if (!supabase || typeof window === 'undefined') return;

  logging = true;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const normalized = normalizeError(error);
    await supabase.from('client_error_events').insert({
      user_id: session.user.id,
      route: `${window.location.pathname}${window.location.search}`.slice(0, 300),
      error_name: `${source}:${normalized.name}`.slice(0, 120),
      message: normalized.message.slice(0, 1200),
      stack_excerpt: normalized.stack?.slice(0, 4000) || null,
      app_version: APP_VERSION,
      user_agent: navigator.userAgent.slice(0, 500),
    });
  } catch {
    // Monitoring must never become a second failure path.
  } finally {
    logging = false;
  }
}

export function installGlobalMonitoring(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    void logClientError(event.error || new Error(event.message || 'Window error'), 'window');
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason ?? 'Unhandled rejection'));
    void logClientError(reason, 'promise');
  });
}
