import { calcMaxEV, fK, fX } from './finance.js'

export default function NegociationPanel({ inp, c }) {
  if (!c.ebitdaRetraite || c.ebitdaRetraite < 50000) return null

  const max125 = calcMaxEV(c.ebitdaRetraite, c.fpNets, inp.cv, inp.tauxS, inp.dureeS, inp.tauxCV, inp.dureeCV, 1.25)
  const max150 = calcMaxEV(c.ebitdaRetraite, c.fpNets, inp.cv, inp.tauxS, inp.dureeS, inp.tauxCV, inp.dureeCV, 1.50)
  const gap125 = max125 - inp.ev
  const gap150 = max150 - inp.ev

  const cvScenarios = [0, 100000, 200000, 300000].map(cv => ({
    cv,
    maxEV: calcMaxEV(c.ebitdaRetraite, c.fpNets, cv, inp.tauxS, inp.dureeS, inp.tauxCV, inp.dureeCV, 1.25),
  }))

  const gapColor = (gap) => gap >= 0 ? '#16a34a' : '#dc2626'
  const gapLabel = (gap) => gap >= 0
    ? `+${fK(gap)} de marge`
    : `${fK(gap)} — déjà au-dessus`

  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <div className="sec-label">Prix maximum d'acquisition</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          EBITDA {fK(c.ebitdaRetraite)} · {inp.tauxS}% · {inp.dureeS} ans · FP nets {fK(c.fpNets)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* DSCR 1.25× */}
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            Max EV · DSCR 1.25×
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
            {fK(max125)}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>seuil bancaire minimum</div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>vs prix actuel</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: gapColor(gap125) }}>
              {gapLabel(gap125)}
            </span>
          </div>
        </div>

        {/* DSCR 1.50× */}
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            Max EV · DSCR 1.50×
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
            {fK(max150)}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>seuil confort banque</div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>vs prix actuel</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: gapColor(gap150) }}>
              {gapLabel(gap150)}
            </span>
          </div>
        </div>

        {/* Impact crédit vendeur */}
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
            Impact crédit vendeur · DSCR 1.25×
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cvScenarios.map(({ cv, maxEV }) => (
              <div key={cv} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: cv === inp.cv ? '#2563eb' : '#64748b', fontWeight: cv === inp.cv ? 600 : 400 }}>
                  {cv === 0 ? 'Sans CV' : `CV ${fK(cv)}`}
                  {cv === inp.cv && cv > 0 && <span style={{ fontSize: 10, color: '#2563eb' }}> ←</span>}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: cv === inp.cv ? '#2563eb' : '#0f172a' }}>
                  {fK(maxEV)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
        Hypothèses constantes : taux {inp.tauxS}% · durée {inp.dureeS} ans · FP nets {fK(c.fpNets)}
        {inp.cv > 0 ? ` · CV ${fK(inp.cv)} à ${inp.tauxCV}%` : ''}
      </div>
    </div>
  )
}