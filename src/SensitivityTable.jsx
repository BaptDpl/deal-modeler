import { sensitivityMatrix, fX } from './finance.js'

const dscrStyle = (dscr, isBase) => ({
  fontFamily: 'var(--mono)',
  fontSize: 13,
  fontWeight: isBase ? 700 : 500,
  textAlign: 'center',
  padding: '9px 10px',
  borderRadius: 6,
  background: dscr >= 1.5 ? '#f0fdf4' : dscr >= 1.25 ? '#fffbeb' : '#fef2f2',
  color:      dscr >= 1.5 ? '#15803d' : dscr >= 1.25 ? '#92400e' : '#991b1b',
  outline: isBase ? '2px solid #3b82f6' : 'none',
  outlineOffset: isBase ? '-2px' : '0',
})

export default function SensitivityTable({ inp, c }) {
  const { ebVars, evVars, matrix } = sensitivityMatrix(inp, c)

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 14 }}>
        <div className="sec-label" style={{ marginBottom: 4 }}>Sensibilité DSCR Year 1</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          Lignes : variation EBITDA retraité · Colonnes : variation prix d'acquisition (EV)
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4, width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', fontSize: 11, color: '#94a3b8', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>
                EBITDA \ Prix
              </th>
              {evVars.map(p => (
                <th key={p} style={{
                  padding: '6px 10px', fontSize: 11, textAlign: 'center',
                  fontWeight: p === 0 ? 700 : 600, textTransform: 'uppercase', letterSpacing: '.05em',
                  color: p === 0 ? '#2563eb' : p < 0 ? '#16a34a' : '#dc2626',
                }}>
                  {p === 0 ? 'BASE' : `${p > 0 ? '+' : ''}${p}%`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ebVars.map((ebPct, ri) => (
              <tr key={ebPct}>
                <td style={{
                  padding: '6px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em',
                  fontWeight: ebPct === 0 ? 700 : 600, whiteSpace: 'nowrap',
                  color: ebPct === 0 ? '#2563eb' : ebPct < 0 ? '#dc2626' : '#16a34a',
                }}>
                  {ebPct === 0 ? 'BASE' : `${ebPct > 0 ? '+' : ''}${ebPct}%`}
                </td>
                {matrix[ri].map((dscr, ci) => {
                  const isBase = ebPct === 0 && evVars[ci] === 0
                  return (
                    <td key={ci} style={dscrStyle(dscr, isBase)}>
                      {fX(dscr)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {[
          { bg: '#f0fdf4', color: '#15803d', label: '≥ 1.50× — bancable, confort' },
          { bg: '#fffbeb', color: '#92400e', label: '1.25–1.50× — bancable, limite' },
          { bg: '#fef2f2', color: '#991b1b', label: '< 1.25× — non bancable' },
        ].map(({ bg, color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 28, height: 16, background: bg, border: `1px solid ${color}44`, borderRadius: 4 }} />
            <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}