import { parseAmount } from './money'

/**
 * Évalue une suite d'additions/soustractions de montants (« 40,01 », « 12+8,5 », « 50-5 »).
 * Renvoie le résultat en centimes, ou null si la saisie est invalide.
 */
export function evaluateExpression(input: string): number | null {
  const compact = input.replace(/[\s  €]/g, '')
  if (!/^[+-]?[^+-]+([+-][^+-]+)*$/.test(compact)) return null

  let result = 0
  for (const term of compact.split(/(?=[+-])/)) {
    const sign = term.startsWith('-') ? -1 : 1
    const cents = parseAmount(term.replace(/^[+-]/, ''))
    if (cents === null) return null
    result += sign * cents
  }
  return result
}
