import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), { status: 405, headers: cors });
  const started = Date.now();
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anon) return new Response(JSON.stringify({ ok: false, database: false, error: 'health_configuration_missing' }), { status: 503, headers: cors });
  try {
    const db = await fetch(`${url}/rest/v1/products?select=id&limit=1`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, signal: AbortSignal.timeout(5000) });
    const ok = db.ok;
    return new Response(JSON.stringify({ ok, service: 'marketpulse-backend', database: ok, latency_ms: Date.now()-started, checked_at: new Date().toISOString() }), { status: ok ? 200 : 503, headers: cors });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, service: 'marketpulse-backend', database: false, error: error instanceof Error ? error.name : 'health_check_failed', latency_ms: Date.now()-started, checked_at: new Date().toISOString() }), { status: 503, headers: cors });
  }
});
