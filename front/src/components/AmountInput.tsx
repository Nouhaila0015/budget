import { useState } from 'react'
import { formatEuro, formatPlain, parseAmount } from '../lib/money'

interface Props {
  value: number
  onChange: (cents: number) => void
  label: string
}

/** Champ montant : affiché « 1 234,50 € », édité « 1234,50 ». Une saisie invalide est annulée. */
export function AmountInput({ value, onChange, label }: Props) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft === null) return
    const cents = parseAmount(draft)
    if (cents !== null && cents !== value) onChange(cents)
    setDraft(null)
  }

  return (
    <input
      className="cell-input amount"
      aria-label={label}
      inputMode="decimal"
      value={draft ?? formatEuro(value)}
      onFocus={(e) => {
        setDraft(value === 0 ? '' : formatPlain(value))
        requestAnimationFrame(() => e.target.select())
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') {
          setDraft(null)
          requestAnimationFrame(() => (e.target as HTMLInputElement).blur())
        }
      }}
    />
  )
}
