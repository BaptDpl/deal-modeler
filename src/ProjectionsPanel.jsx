import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { fK, fP, fX, dscrColor } from './finance.js'

export default function ProjectionsPanel({ proj, salaire, hasAddbacks }) {
  const ebitdaLabel = hasAddbacks ? 'EBITDA retraité' : 'EBITDA'

  const rows = [
    { label: "Chiffre d'affaires", fn: p => fK(p.ca),      col: () => '#64748b' },
    { label: ebitdaLabel,          fn: p => fK(p.eb),      col: () => '#16a34a', bold: true },
    { label: '  Marge EBITDA',     fn: p => fP(p.mg*100),  col: () => '#94a3b8' },
    { label: 'Intérêts',           fn: p => `(${fK(p.intTot)})`,  col: () => '#dc2626' },
    { label: 'Remboursement',      fn: p => `(${fK(p.rmbTot)})`,  col: () => '#64748b' },
    { label: 'IS',                 fn: p => `(${fK(p.isN)})`,     col: () => '#d97706' },
    { label: 'FCF brut',           fn: p => fK(p.fcfBrut),  col: p => p.fcfBrut >= 0 ? '#0f172a' : '#dc2626' },
    { label: 'Salaire Baptiste',   fn: () => `(${fK(salaire)})`,  col: () => '#94a3b8' },
    { sep: true },
    { label: 'FCF net',            fn: p => fK(p.fcfNet),   col: p => p.fcfNet >= 0 ? '#16a34a' : '#dc2626', bold: true },
    { label: 'DSCR',               fn: p => fX(p.dscrN),   col: p => dscrColor(p.dscrN) },
    { label: 'Dette résiduelle',   fn: p => fK(p.soldeDette), col: () => '#94a3b8' },
  ]

  const chartData = proj.map(p => ({
    yr: `Y${p.yr}`,
    EBITDA: Math.round(p.eb),
    'FCF net': Math.round(p.fcfNet),
    Dette: Math.round(p.soldeDette),
  }))

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div className="sec-label" style={{ marginBottom: 18 }}>Projections 5 ans</div>

      <div style={{ overflowX: 'auto', marginBottom: 28 }}>
        <table className="proj-table">
          <colgroup>
            <col style={{ width: 185 }} />
            {[1,2,3,4,5].map(i => <col key={i} style={{ width: 86 }} />)}
          </colgroup>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}></th>
              {[1,2,3,4,5].map(y => <th key={y}>Year {y}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              if (row.sep) return (
                <tr key={`s${idx}`} className="sep-row"><td colSpan={6} /></tr>
              )
              return (
                <tr key={row.label} className={row.bold ? 'bold-row' : ''}>
                  <td>{row.label}</td>
                  {proj.map(p => (
                    <td key={p.yr} style={{ color: row.col(p) }}>{row.fn(p)}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Dual Y-axis chart */}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="yr" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${Math.round(v/1000)}k`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v/1000)}k`} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => [`${Math.round(v/1000)}k€`, n]}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Bar yAxisId="left" dataKey="EBITDA"  fill="#16a34a" opacity={.8} radius={[4,4,0,0]} />
            <Bar yAxisId="left" dataKey="FCF net" fill="#2563eb" opacity={.8} radius={[4,4,0,0]} />
            <Line yAxisId="right" type="monotone" dataKey="Dette" stroke="#dc2626"
              strokeWidth={2.5} strokeDasharray="5 3"
              dot={{ fill: '#dc2626', r: 4, strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
        Marge EBITDA stable · IS = (EBITDA − intérêts) × taux · pas d'amortissements · dette axe droit
      </div>
    </div>
  )
}