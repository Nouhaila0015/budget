import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT ?? 4100);
const dataFile = process.env.BUDGET_DATA ?? join(root, 'data', 'budget.json');
const frontDir = join(root, '..', 'front', 'dist');

createApp(dataFile, frontDir).listen(port, '127.0.0.1', () => {
  console.log(`Budget disponible sur http://localhost:${port}`);
});
