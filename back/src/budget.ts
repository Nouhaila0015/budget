// Modèle et règles métier du budget. Les montants sont stockés en centimes (entiers).

export const SECTIONS = ['ressources', 'fixes', 'variables', 'epargne'] as const;
export type SectionKey = (typeof SECTIONS)[number];

export interface Line {
  id: string;
  label: string;
  budget: number; // centimes
  actual: number; // centimes
  notes: string;
}

export type Month = Record<SectionKey, Line[]>;

export interface Store {
  months: Record<string, Month>;
}

const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isMonthKey(value: string): boolean {
  return MONTH_KEY.test(value);
}

export function emptyMonth(): Month {
  return { ressources: [], fixes: [], variables: [], epargne: [] };
}

/**
 * Renvoie le mois demandé. S'il n'existe pas encore, il est dérivé du dernier mois
 * antérieur enregistré : libellés et budgétés repris, réel remis à 0, notes vidées.
 */
export function getMonth(store: Store, key: string): Month {
  const existing = store.months[key];
  if (existing) return existing;

  const previousKey = Object.keys(store.months)
    .filter((k) => k < key)
    .sort()
    .pop();
  if (!previousKey) return emptyMonth();

  const previous = store.months[previousKey];
  const month = emptyMonth();
  for (const section of SECTIONS) {
    month[section] = previous[section].map((line) => ({
      ...line,
      actual: 0,
      notes: '',
    }));
  }
  return month;
}

function isCents(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

/** Valide un mois reçu du front. Renvoie le mois nettoyé, ou null s'il est invalide. */
export function parseMonth(input: unknown): Month | null {
  if (typeof input !== 'object' || input === null) return null;
  const raw = input as Record<string, unknown>;
  const month = emptyMonth();
  for (const section of SECTIONS) {
    const lines = raw[section];
    if (!Array.isArray(lines)) return null;
    for (const line of lines) {
      if (typeof line !== 'object' || line === null) return null;
      const { id, label, budget, actual, notes } = line as Record<string, unknown>;
      if (typeof id !== 'string' || !id) return null;
      if (typeof label !== 'string' || typeof notes !== 'string') return null;
      if (!isCents(budget) || !isCents(actual)) return null;
      month[section].push({ id, label, budget, actual, notes });
    }
  }
  return month;
}
