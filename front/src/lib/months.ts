const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

/** Clé « AAAA-MM » du mois courant. */
export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number)
  return currentMonthKey(new Date(year, month - 1 + delta, 1))
}

/** « 2026-10 » → « Octobre 2026 ». */
export function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  const label = monthName.format(new Date(year, month - 1, 1))
  return label.charAt(0).toUpperCase() + label.slice(1)
}
