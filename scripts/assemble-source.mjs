import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function assemble(partsDir, output) {
  const files = (await readdir(partsDir)).filter((name) => name.startsWith('part-')).sort();
  if (!files.length) throw new Error(`No source parts found in ${partsDir}`);
  const chunks = await Promise.all(files.map((name) => readFile(path.join(partsDir, name), 'utf8')));
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, chunks.join(''), 'utf8');
  console.log(`assembled ${output} from ${files.length} parts`);
}

await assemble('.sourceparts/context', 'src/context/AppContext.tsx');
await assemble('.sourceparts/backend', 'src/services/backendService.ts');
