import { describe, expect, it } from 'vitest'
import { evaluateExpression } from './expression'

describe('evaluateExpression', () => {
  it('évalue un montant ou une suite de + et −', () => {
    expect(evaluateExpression('40,01')).toBe(4001)
    expect(evaluateExpression('12+8,5')).toBe(2050)
    expect(evaluateExpression('50 - 5')).toBe(4500)
    expect(evaluateExpression('-3,20')).toBe(-320)
    expect(2039 + evaluateExpression('40,01')!).toBe(6040)
  })

  it('refuse les saisies invalides', () => {
    expect(evaluateExpression('')).toBeNull()
    expect(evaluateExpression('12+')).toBeNull()
    expect(evaluateExpression('12*3')).toBeNull()
    expect(evaluateExpression('1++2')).toBeNull()
    expect(evaluateExpression('abc')).toBeNull()
  })
})
