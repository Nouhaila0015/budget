import { useState } from 'react'
import { evaluateExpression } from '../lib/expression'
import { formatEuro } from '../lib/money'

interface Props {
  label: string
  actual: number
  onValidate: (newActual: number) => void
  onCancel: () => void
}

/** Petite calculatrice : ajoute un montant (ou une expression) au réel existant. */
export function Calculator({ label, actual, onValidate, onCancel }: Props) {
  const [input, setInput] = useState('')
  const [touched, setTouched] = useState(false)

  const amount = input.trim() === '' ? null : evaluateExpression(input)
  const result = amount === null ? null : actual + amount
  const error =
    input.trim() === ''
      ? 'Saisis un montant.'
      : amount === null
        ? 'Saisie invalide : utilise des montants avec + ou − (ex. 12+8,5).'
        : result! < 0
          ? 'Le réel ne peut pas devenir négatif.'
          : null

  const validate = () => {
    setTouched(true)
    if (error === null && result !== null) onValidate(result)
  }

  return (
    <div className="calculator" role="dialog" aria-label={`Ajouter au réel — ${label}`}>
      <strong>Ajouter au réel — « {label || 'sans libellé'} »</strong>
      <label className="calc-field">
        Montant :
        <input
          autoFocus
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') validate()
            if (e.key === 'Escape') onCancel()
          }}
        />
      </label>
      <p className="calc-preview">
        {formatEuro(actual)} {amount !== null && amount < 0 ? '−' : '+'}{' '}
        {amount === null ? '…' : formatEuro(Math.abs(amount))} ={' '}
        <b>{result === null ? '…' : formatEuro(result)}</b>
      </p>
      {touched && error && <p className="calc-error">{error}</p>}
      <div className="calc-buttons">
        <button type="button" className="btn-validate" onClick={validate}>
          Valider
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Annuler
        </button>
      </div>
      <p className="calc-hint">Accepte aussi 12+8,5 ou 50-5.</p>
    </div>
  )
}
