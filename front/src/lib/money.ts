// Les montants sont manipulés en centimes (entiers) pour éviter les erreurs d'arrondi.

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const plain = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })
const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function formatEuro(cents: number): string {
  return euro.format(cents / 100)
}

/** Format d'édition : « 1234,50 », sans symbole ni séparateur de milliers. */
export function formatPlain(cents: number): string {
  return plain.format(cents / 100)
}

export function formatPercent(ratio: number | null): string {
  return ratio === null ? '-' : percent.format(ratio)
}

/** Convertit « 1 234,5 », « 1234.50 » ou « 12 € » en centimes. Renvoie null si invalide. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[\s  €]/g, '').replace(',', '.')
  if (cleaned === '') return 0
  if (!/^-?\d+(\.\d{0,2})?$/.test(cleaned) && !/^-?\.\d{1,2}$/.test(cleaned)) return null
  return Math.round(Number(cleaned) * 100)
}
