import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createApp } from './app.js';

async function withServer(fn: (url: string) => Promise<void>) {
  const dir = await mkdtemp(join(tmpdir(), 'budget-'));
  const server = createApp(join(dir, 'budget.json')).listen(0);
  await new Promise((r) => server.once('listening', r));
  const { port } = server.address() as AddressInfo;
  try {
    await fn(`http://127.0.0.1:${port}/api/months`);
  } finally {
    server.close();
  }
}

const line = (id: string, label: string, budget: number, actual: number, notes = '') => ({
  id, label, budget, actual, notes,
});

test('un premier mois est vide', () =>
  withServer(async (url) => {
    const res = await fetch(`${url}/2026-10`);
    assert.deepEqual(await res.json(), { ressources: [], fixes: [], variables: [], epargne: [] });
  }));

test('un nouveau mois reprend libellés et budgétés, réel et notes remis à zéro', () =>
  withServer(async (url) => {
    const october = {
      ressources: [line('a', 'Salaire', 236000, 239000, 'ok')],
      fixes: [],
      variables: [line('b', 'Courses', 20000, 6040)],
      epargne: [],
    };
    const put = await fetch(`${url}/2026-10`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(october),
    });
    assert.equal(put.status, 200);

    const november = await (await fetch(`${url}/2026-11`)).json();
    assert.deepEqual(november.ressources, [line('a', 'Salaire', 236000, 0)]);
    assert.deepEqual(november.variables, [line('b', 'Courses', 20000, 0)]);

    // Octobre n'est pas modifié, et un mois antérieur reste vide.
    assert.deepEqual(await (await fetch(`${url}/2026-10`)).json(), october);
    assert.deepEqual((await (await fetch(`${url}/2026-09`)).json()).ressources, []);
  }));

test('les données invalides sont refusées', () =>
  withServer(async (url) => {
    assert.equal((await fetch(`${url}/2026-13`)).status, 400);
    const bad = await fetch(`${url}/2026-10`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ressources: [line('a', 'x', 1.5, 0)], fixes: [], variables: [], epargne: [] }),
    });
    assert.equal(bad.status, 400);
  }));
