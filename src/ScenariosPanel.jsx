import { fK, fP, fX, dscrColor, moicColor, irrColor, scoreColor, scoreBg } from './finance.js'

const metrics = [
  { label: 'DSCR Year 1', fn: sc => fX(sc.dscr),                    col: sc => dscrColor(sc.dscr) },
  { label: 'FCF net Y1',  fn: sc => fK(sc.proj[0]?.fcfNet ?? 0),    col: sc => (sc.proj[0]?.fcfNet ?? 0) >= 0 ? '#16a34a' : '#dc2626' },
  { label: 'MOIC Y5',     fn: sc => fX(sc.moic),                    col: sc => moicColor(sc.moic) },
  { label: 'IRR estimé',  fn: sc => fP(sc.irr),                     col: sc => irrColor(sc.irr) },
  { label: 'Deal Score',  fn: sc => `${Math.round(sc.score)}/100`,   col: sc => scoreColor(sc.score) },
]

export default function ScenariosPanel({ scenarios, inp }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div className="sec-label" style={{ marginBottom: 16 }}>Analyse de scénarios</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {scenarios.map(({ label, sc, color, bg, growthDelta, margeDelta }) => (
          <div key={label} style={{
            background: bg,
            borderRadius: 10,
            padding: '16px 18px',
            border: `1px solid ${color}33`,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color }}>{label}</span>
              <div style={{
                background: scoreBg(sc.score),
                border: `1px solid ${scoreColor(sc.score)}55`,
                borderRadius: 999, padding: '2px 10px',
                fontSize: 11, fontWeight: 700, color: scoreColor(sc.score),
              }}>
                {sc.score >= 75 ? '✓ GO' : sc.score >= 50 ? '⚠ WATCH' : '✗ NO-GO'}
              </div>
            </div>

            {/* Hypothèses */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 11, color: '#64748b', background: '#fff', borderRadius: 6, padding: '3px 8px', border: '1px solid #e2e8f0' }}>
                Croissance&nbsp;
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
                  {inp.growth + growthDelta > 0 ? '+' : ''}{inp.growth + growthDelta}%
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', background: '#fff', borderRadius: 6, padding: '3px 8px', border: '1px solid #e2e8f0' }}>
                Marge&nbsp;
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
                  {fP(sc.marge * 100)}
                </span>
              </div>
            </div>

            {/* Métriques */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {metrics.map(m => (
                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{m.label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: m.col(sc) }}>
                    {m.fn(sc)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
        Pessimiste : −2pp croissance, −3pp marge · Optimiste : +2pp croissance, +3pp marge vs scénario base
      </div>
    </div>
  )
}