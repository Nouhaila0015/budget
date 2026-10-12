import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Store } from './budget.js';

export async function loadStore(file: string): Promise<Store> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as Store;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { months: {} };
    throw err;
  }
}

/** Écrit dans un fichier temporaire puis renomme, pour ne jamais laisser un JSON à moitié écrit. */
export async function saveStore(file: string, store: Store): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2));
  await rename(tmp, file);
}
