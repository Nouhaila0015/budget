export const SECTIONS = [
  { key: 'ressources', title: 'Ressources', icon: '💰', totalLabel: 'Total ressources' },
  { key: 'fixes', title: 'Charges fixes', icon: '🏠', totalLabel: 'Total charges fixes' },
  { key: 'variables', title: 'Charges variables', icon: '🛒', totalLabel: 'Total charges variables' },
  { key: 'epargne', title: 'Épargne', icon: '📈', totalLabel: 'Total épargne' },
] as const

export type SectionKey = (typeof SECTIONS)[number]['key']

export interface Line {
  id: string
  label: string
  budget: number // centimes
  actual: number // centimes
  notes: string
}

export type Month = Record<SectionKey, Line[]>

export interface Amounts {
  budget: number
  actual: number
}

/** 'ok' = vert, 'ko' = rouge, null = rien à signaler (ligne vide). */
export type Status = 'ok' | 'ko' | null

export function total(lines: Line[]): Amounts {
  return lines.reduce(
    (sum, line) => ({ budget: sum.budget + line.budget, actual: sum.actual + line.actual }),
    { budget: 0, actual: 0 },
  )
}

export function usage({ budget, actual }: Amounts): number | null {
  return budget === 0 ? null : actual / budget
}

/**
 * Pour les charges et l'épargne, on est dans le budget si réel ≤ budgété.
 * Pour les ressources, c'est l'inverse : on veut avoir reçu au moins le prévu.
 */
export function status(section: SectionKey, { budget, actual }: Amounts): Status {
  if (budget === 0 && actual === 0) return null
  return section === 'ressources' ? (actual >= budget ? 'ok' : 'ko') : actual <= budget ? 'ok' : 'ko'
}

export interface Recap {
  totals: Record<SectionKey, Amounts>
  /** Ressources − (charges fixes + charges variables + épargne). */
  net: Amounts
  /** Part des ressources dépensée ou épargnée (null si aucune ressource). */
  spentRatio: { budget: number | null; actual: number | null }
}

export function recap(month: Month): Recap {
  const totals = Object.fromEntries(SECTIONS.map(({ key }) => [key, total(month[key])])) as Record<SectionKey, Amounts>
  const outgoing = (field: keyof Amounts) => totals.fixes[field] + totals.variables[field] + totals.epargne[field]
  const income = totals.ressources
  return {
    totals,
    net: { budget: income.budget - outgoing('budget'), actual: income.actual - outgoing('actual') },
    spentRatio: {
      budget: income.budget === 0 ? null : outgoing('budget') / income.budget,
      actual: income.actual === 0 ? null : outgoing('actual') / income.actual,
    },
  }
}
