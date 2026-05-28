import { useState, useMemo } from 'react'
import InputPanel        from './InputPanel.jsx'
import MetricsPanel      from './MetricsPanel.jsx'
import ProjectionsPanel  from './ProjectionsPanel.jsx'
import SensitivityTable  from './SensitivityTable.jsx'
import ScenariosPanel    from './ScenariosPanel.jsx'
import { calculate, DEFAULT_INPUTS, calcScenarios, scoreColor, scoreBg, scoreBorder, fK } from './finance.js'
import { exportToExcel } from './exportExcel.js'
import NegociationPanel from './NegociationPanel.jsx'


export default function App() {
  const [inp, setInp] = useState(DEFAULT_INPUTS)
  const update = (key, value) => setInp(p => ({ ...p, [key]: value }))

  const c         = useMemo(() => calculate(inp), [inp])
  const scenarios = useMemo(() => calcScenarios(inp, c), [inp, c])
  const scoreLabel = c.score >= 75 ? 'GO — RECOMMANDÉ' : c.score >= 50 ? 'WATCH' : 'NO-GO'

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 0 48px' }}>

      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '12px 28px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24, position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 2 }}>
            Oc Transmission · Deal Modeler
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <input type="text" value={inp.name} onChange={e => update('name', e.target.value)}
              style={{ fontSize: 22, fontWeight: 700, border: 'none', background: 'transparent', color: '#0f172a', padding: 0, outline: 'none', width: 220, fontFamily: 'var(--sans)' }} />
            <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'var(--mono)' }}>
              / acquisition · {fK(inp.ev)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {c.totalAddbacks > 0 && (
            <div style={{ fontSize: 12, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 999, padding: '4px 12px', color: '#15803d', fontFamily: 'var(--mono)' }}>
              EBITDA retraité <strong>{Math.round(c.ebitdaRetraite / 1000)}k€</strong>
              <span style={{ color: '#16a34a' }}> +{Math.round(c.totalAddbacks / 1000)}k€</span>
            </div>
          )}

          {/* Export button */}
          <button
            onClick={() => exportToExcel(inp, c)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 8, padding: '7px 14px',
              fontSize: 12, fontWeight: 600, color: '#475569',
              cursor: 'pointer', fontFamily: 'var(--sans)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff';    e.currentTarget.style.borderColor = '#e2e8f0' }}
          >
            ↓ Export Excel
          </button>

          {/* Score badge */}
          <div style={{
            background: scoreBg(c.score), border: `1.5px solid ${scoreBorder(c.score)}`,
            borderRadius: 999, padding: '5px 16px', fontSize: 13, fontWeight: 700,
            fontFamily: 'var(--mono)', color: scoreColor(c.score),
          }}>
            {c.score >= 75 ? '✓' : c.score >= 50 ? '⚠' : '✗'} {scoreLabel} — {Math.round(c.score)}/100
          </div>
        </div>
      </div>

      <div style={{ padding: '0 28px' }}>

        <MetricsPanel.Hero inp={inp} c={c} />

        <div style={{ marginTop: 12 }}>
          <NegociationPanel inp={inp} c={c} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, marginTop: 20 }}>
          <InputPanel inp={inp} onChange={update} c={c} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MetricsPanel.Secondary inp={inp} c={c} />
            <ProjectionsPanel proj={c.proj} salaire={inp.salaire} hasAddbacks={c.totalAddbacks > 0} />
            <SensitivityTable inp={inp} c={c} />
            <ScenariosPanel scenarios={scenarios} inp={inp} />
          </div>
        </div>

      </div>
    </div>
  )
}