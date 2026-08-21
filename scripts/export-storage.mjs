import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const output = process.env.STORAGE_BACKUP_DIR || 'storage-backup';
const buckets = (process.env.STORAGE_BUCKETS || 'price-evidence,profile-avatars').split(',').map((v) => v.trim()).filter(Boolean);

if (!url || !secret) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required.');
const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

async function listAll(bucket, prefix = '') {
  const rows = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw error;
    const page = data || [];
    for (const item of page) {
      const objectPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) rows.push({ path: objectPath, metadata: item.metadata || null, updated_at: item.updated_at || null });
      else rows.push(...await listAll(bucket, objectPath));
    }
    if (page.length < 1000) break;
    offset += page.length;
  }
  return rows;
}

await mkdir(output, { recursive: true });
const manifest = { created_at: new Date().toISOString(), buckets: {} };
for (const bucket of buckets) {
  const objects = await listAll(bucket);
  manifest.buckets[bucket] = objects;
  for (const object of objects) {
    const { data, error } = await supabase.storage.from(bucket).download(object.path);
    if (error) throw error;
    const target = path.join(output, bucket, object.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(await data.arrayBuffer()));
  }
}
await writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Exported ${Object.values(manifest.buckets).reduce((n, rows) => n + rows.length, 0)} Storage objects.`);
