import { useState } from 'react'
import { status, total, usage, type Amounts, type Line, type SectionKey } from '../lib/budget'
import { formatEuro, formatPercent } from '../lib/money'
import { AmountInput } from './AmountInput'

interface Props {
  sectionKey: SectionKey
  title: string
  icon: string
  totalLabel: string
  lines: Line[]
  onChange: (lines: Line[]) => void
}

function Indicators({ section, amounts }: { section: SectionKey; amounts: Amounts }) {
  const state = status(section, amounts)
  const empty = amounts.budget === 0 && amounts.actual === 0
  return (
    <>
      <td className={`num ${state ?? ''}`}>{empty ? '-' : formatEuro(amounts.budget - amounts.actual)}</td>
      <td className={`num ${state ?? ''}`}>{formatPercent(usage(amounts))}</td>
    </>
  )
}

export function Section({ sectionKey, title, icon, totalLabel, lines, onChange }: Props) {
  const [addedId, setAddedId] = useState<string | null>(null)

  const update = (id: string, patch: Partial<Line>) =>
    onChange(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)))

  const remove = (line: Line) => {
    if (window.confirm(`Supprimer la ligne « ${line.label || 'sans libellé'} » ?`)) {
      onChange(lines.filter((l) => l.id !== line.id))
    }
  }

  const add = () => {
    const id = crypto.randomUUID()
    setAddedId(id)
    onChange([...lines, { id, label: '', budget: 0, actual: 0, notes: '' }])
  }

  const sum = total(lines)

  return (
    <section className="section">
      <h2 className={`section-title ${sectionKey}`}>
        <span aria-hidden>{icon}</span> {title}
      </h2>
      <table className="grid">
        <colgroup>
          <col className="c-label" />
          <col className="c-amount" />
          <col className="c-amount" />
          <col className="c-amount" />
          <col className="c-percent" />
          <col className="c-notes" />
          <col className="c-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>Libellé</th>
            <th className="num">Budgété (€)</th>
            <th className="num">Réel (€)</th>
            <th className="num">Différence (€)</th>
            <th className="num">% utilisé</th>
            <th>Notes</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id}>
              <td>
                <input
                  className="cell-input"
                  aria-label="Libellé"
                  placeholder="Libellé…"
                  value={line.label}
                  autoFocus={line.id === addedId}
                  onChange={(e) => update(line.id, { label: e.target.value })}
                />
              </td>
              <td>
                <AmountInput label={`Budgété ${line.label}`} value={line.budget} onChange={(budget) => update(line.id, { budget })} />
              </td>
              <td>
                <AmountInput label={`Réel ${line.label}`} value={line.actual} onChange={(actual) => update(line.id, { actual })} />
              </td>
              <Indicators section={sectionKey} amounts={line} />
              <td>
                <input
                  className="cell-input notes"
                  aria-label="Notes"
                  value={line.notes}
                  onChange={(e) => update(line.id, { notes: e.target.value })}
                />
              </td>
              <td className="actions">
                <button type="button" className="icon-btn" title="Supprimer la ligne" onClick={() => remove(line)}>
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total">
            <td>{totalLabel.toUpperCase()}</td>
            <td className="num">{formatEuro(sum.budget)}</td>
            <td className="num">{formatEuro(sum.actual)}</td>
            <Indicators section={sectionKey} amounts={sum} />
            <td />
            <td />
          </tr>
        </tfoot>
      </table>
      <button type="button" className="add-line" onClick={add}>
        + Ajouter une ligne
      </button>
    </section>
  )
}
