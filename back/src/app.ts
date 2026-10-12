import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getMonth, isMonthKey, parseMonth } from './budget.js';
import { loadStore, saveStore } from './storage.js';

export function createApp(dataFile: string, frontDir?: string) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Les écritures sont enchaînées pour éviter que deux PUT simultanés s'écrasent.
  let queue: Promise<unknown> = Promise.resolve();
  const serialize = <T>(task: () => Promise<T>): Promise<T> => {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  };

  app.get('/api/months/:key', async (req, res) => {
    const { key } = req.params;
    if (!isMonthKey(key)) return res.status(400).json({ error: 'Mois invalide (format AAAA-MM)' });
    const store = await serialize(() => loadStore(dataFile));
    res.json(getMonth(store, key));
  });

  app.put('/api/months/:key', async (req, res) => {
    const { key } = req.params;
    if (!isMonthKey(key)) return res.status(400).json({ error: 'Mois invalide (format AAAA-MM)' });
    const month = parseMonth(req.body);
    if (!month) return res.status(400).json({ error: 'Données du mois invalides' });
    await serialize(async () => {
      const store = await loadStore(dataFile);
      store.months[key] = month;
      await saveStore(dataFile, store);
    });
    res.json(month);
  });

  if (frontDir && existsSync(frontDir)) {
    app.use(express.static(frontDir));
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(join(frontDir, 'index.html')));
  }

  return app;
}
