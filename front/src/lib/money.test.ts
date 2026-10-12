import { describe, expect, it } from 'vitest'
import { formatPercent, parseAmount } from './money'
import { status, total, usage } from './budget'

describe('parseAmount', () => {
  it('accepte virgule, point, espaces et symbole euro', () => {
    expect(parseAmount('20,39')).toBe(2039)
    expect(parseAmount('40.01')).toBe(4001)
    expect(parseAmount('1 234,5 €')).toBe(123450)
    expect(parseAmount('')).toBe(0)
  })

  it('refuse les saisies invalides', () => {
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('1,234')).toBeNull()
    expect(parseAmount('1,2,3')).toBeNull()
  })
})

describe('calculs', () => {
  const lines = [
    { id: 'a', label: 'Courses', budget: 27000, actual: 7400, notes: '' },
    { id: 'b', label: 'Cadeaux', budget: 5000, actual: 6500, notes: '' },
  ]

  it('calcule le total et le pourcentage utilisé', () => {
    expect(total(lines)).toEqual({ budget: 32000, actual: 13900 })
    expect(usage({ budget: 5000, actual: 6500 })).toBe(1.3)
    expect(formatPercent(usage({ budget: 0, actual: 100 }))).toBe('-')
  })

  it('vert dans le budget, rouge au-dessus (inverse pour les ressources)', () => {
    expect(status('variables', lines[0])).toBe('ok')
    expect(status('variables', lines[1])).toBe('ko')
    expect(status('ressources', { budget: 236000, actual: 239000 })).toBe('ok')
    expect(status('ressources', { budget: 30000, actual: 0 })).toBe('ko')
    expect(status('fixes', { budget: 0, actual: 0 })).toBeNull()
  })
})
