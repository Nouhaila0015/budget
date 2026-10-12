import type { Month } from './lib/budget'

async function request(url: string, init?: RequestInit): Promise<Month> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`Erreur ${res.status}`)
  return res.json()
}

export function fetchMonth(key: string): Promise<Month> {
  return request(`/api/months/${key}`)
}

export function saveMonth(key: string, month: Month): Promise<Month> {
  return request(`/api/months/${key}`, {
    method: 'PUT',
    keepalive: true, // permet de finir l'enregistrement si l'onglet est fermé
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(month),
  })
}
