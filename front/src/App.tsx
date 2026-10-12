import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchMonth, saveMonth } from './api'
import { Section } from './components/Section'
import { SECTIONS, type Line, type Month, type SectionKey } from './lib/budget'
import { currentMonthKey, monthLabel, shiftMonth } from './lib/months'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const SAVE_DELAY_MS = 500

export default function App() {
  const [monthKey, setMonthKey] = useState(currentMonthKey)
  // Mois chargé, associé à sa clé (month = null si le chargement a échoué).
  const [loaded, setLoaded] = useState<{ key: string; month: Month | null } | null>(null)
  const month = loaded?.key === monthKey ? loaded.month : null
  const loadError = loaded?.key === monthKey && loaded.month === null
  const [saveState, setSaveState] = useState<SaveState>('idle')

  // Enregistrement différé : on regroupe les frappes, et les écritures sont enchaînées
  // pour qu'un chargement ne lise jamais un mois dont l'enregistrement est en cours.
  const pending = useRef<{ key: string; month: Month } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const writes = useRef<Promise<unknown>>(Promise.resolve())

  const flush = useCallback(() => {
    window.clearTimeout(timer.current)
    const toSave = pending.current
    if (!toSave) return
    pending.current = null
    writes.current = writes.current
      .then(() => saveMonth(toSave.key, toSave.month))
      .then(
        () => setSaveState(pending.current ? 'saving' : 'saved'),
        () => setSaveState('error'),
      )
  }, [])

  useEffect(() => {
    let cancelled = false
    writes.current
      .then(() => fetchMonth(monthKey))
      .then(
        (data) => !cancelled && setLoaded({ key: monthKey, month: data }),
        () => !cancelled && setLoaded({ key: monthKey, month: null }),
      )
    return () => {
      cancelled = true
    }
  }, [monthKey])

  useEffect(() => {
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [flush])

  const updateSection = (section: SectionKey, lines: Line[]) => {
    if (!month) return
    const next = { ...month, [section]: lines }
    setLoaded({ key: monthKey, month: next })
    pending.current = { key: monthKey, month: next }
    setSaveState('saving')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(flush, SAVE_DELAY_MS)
  }

  const goTo = (delta: number) => {
    flush()
    setMonthKey((key) => shiftMonth(key, delta))
  }

  return (
    <main className="page">
      <header>
        <h1 className="banner">MON BUDGET</h1>
        <div className="month-bar">
          <div className="month-nav">
            <button type="button" className="arrow" aria-label="Mois précédent" onClick={() => goTo(-1)}>
              ←
            </button>
            <strong>{monthLabel(monthKey)}</strong>
            <button type="button" className="arrow" aria-label="Mois suivant" onClick={() => goTo(1)}>
              →
            </button>
          </div>
          <span className={`save-state ${saveState}`}>
            {saveState === 'saving' && 'Enregistrement…'}
            {saveState === 'saved' && 'Enregistré'}
            {saveState === 'error' && "Erreur d'enregistrement"}
          </span>
        </div>
      </header>

      {loadError && <p className="message error">Impossible de charger ce mois. Le serveur est-il lancé ?</p>}
      {!month && !loadError && <p className="message">Chargement…</p>}

      {month &&
        SECTIONS.map((section) => (
          <Section
            key={`${monthKey}-${section.key}`}
            sectionKey={section.key}
            title={section.title}
            icon={section.icon}
            totalLabel={section.totalLabel}
            lines={month[section.key]}
            onChange={(lines) => updateSection(section.key, lines)}
          />
        ))}
    </main>
  )
}
