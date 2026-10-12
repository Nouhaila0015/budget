import { recap, SECTIONS, type Month } from '../lib/budget'
import { formatEuro, formatPercent } from '../lib/money'

/** Récapitulatif du mois, en lecture seule. */
export function Recap({ month }: { month: Month }) {
  const { totals, net, spentRatio } = recap(month)
  const tone = (cents: number) => (cents < 0 ? 'ko' : 'ok')

  return (
    <section className="section">
      <h2 className="section-title recap">
        <span aria-hidden>📊</span> Récap du mois
      </h2>
      <table className="grid recap-grid">
        <colgroup>
          <col className="c-recap-label" />
          <col className="c-amount" />
          <col className="c-amount" />
        </colgroup>
        <thead>
          <tr>
            <th />
            <th className="num">Budgété (€)</th>
            <th className="num">Réel (€)</th>
          </tr>
        </thead>
        <tbody>
          {SECTIONS.map((section) => (
            <tr key={section.key}>
              <td>{section.totalLabel}</td>
              <td className="num">{formatEuro(totals[section.key].budget)}</td>
              <td className="num">{formatEuro(totals[section.key].actual)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="net">
            <td>SOLDE NET (ressources − charges − épargne)</td>
            <td className={`num ${tone(net.budget)}`}>{formatEuro(net.budget)}</td>
            <td className={`num ${tone(net.actual)}`}>{formatEuro(net.actual)}</td>
          </tr>
          <tr className="net-ratio">
            <td>% des ressources dépensées ou épargnées</td>
            <td className="num">{formatPercent(spentRatio.budget)}</td>
            <td className="num">{formatPercent(spentRatio.actual)}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}
