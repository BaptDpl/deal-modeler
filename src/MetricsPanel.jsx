import { fK, fP, fX, fPi, dscrColor, evColor, moicColor, irrColor, scoreColor, scoreBg, scoreFactors } from './finance.js'

function CircularGauge({ score, size = 80 }) {
  const r = (size / 2) - 7
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = scoreColor(score)
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  )
}

function SubScoreBar({ label, value, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: '#0f172a' }}>
          {value}<span style={{ color: '#94a3b8', fontWeight: 400 }}>/25</span>
        </span>
      </div>
      <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${(value / 25) * 100}%`, background: color, borderRadius: 2, transition: 'width .3s' }} />
      </div>
    </div>
  )
}

function HeroMetricCard({ label, value, color, sub, extra, borderColor }) {
  return (
    <div className="hero-card" style={{ borderTopColor: borderColor || color }}>
      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 34, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#64748b' }}>{sub}</div>}
      {extra && <div style={{ marginTop: 10 }}>{extra}</div>}
    </div>
  )
}

function SmallMetricCard({ label, value, color, sub }) {
  return (
    <div className="metric-card">
      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function Hero({ inp, c }) {
  const { score, subScores: ss, dscr, moic, irr } = c
  const scoreLabel = score >= 75 ? 'GO — RECOMMANDÉ' : score >= 50 ? 'WATCH' : 'NO-GO'
  const scColor = scoreColor(score)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16 }}>

      {/* Deal Score — compact */}
      <div className="hero-card" style={{ borderTopColor: scColor }}>
        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>
          Deal Score · Composite pondéré
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 52, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
              {Math.round(score)}
              <span style={{ fontSize: 22, color: '#94a3b8', fontWeight: 400 }}>/100</span>
            </div>
            <div style={{
              marginTop: 8, display: 'inline-block',
              background: scoreBg(score), border: `1px solid ${scColor}55`,
              borderRadius: 999, padding: '3px 12px',
              fontSize: 12, fontWeight: 700, color: scColor,
            }}>
              {score >= 75 ? '✓' : score >= 50 ? '⚠' : '✗'} {scoreLabel}
            </div>
          </div>
          <CircularGauge score={score} size={80} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <SubScoreBar label="Rentab."  value={ss.rentabilite} color="#2563eb" />
          <SubScoreBar label="Solvab."  value={ss.solvabilite} color="#7c3aed" />
          <SubScoreBar label="Croiss."  value={ss.croissance}  color="#059669" />
          <SubScoreBar label="Risque"   value={ss.risque}      color="#d97706" />
        </div>
      </div>

      {/* DSCR */}
      <HeroMetricCard
        label="DSCR · Year 1"
        value={fX(dscr)}
        color={dscrColor(dscr)}
        borderColor={dscrColor(dscr)}
        sub={dscr >= 1.25
          ? `+${Math.round((dscr / 1.25 - 1) * 100)}% vs seuil banque (1.25×)`
          : '⚠ Sous le seuil bancaire (1.25×)'}
        extra={
          <div>
            <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${Math.min(100, (dscr / 2) * 100)}%`, background: dscrColor(dscr), borderRadius: 2, transition: 'width .3s' }} />
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Seuil min : 1.25×</div>
          </div>
        }
      />

      {/* MOIC */}
      <HeroMetricCard
        label="MOIC · Y5"
        value={fX(moic)}
        color={moicColor(moic)}
        borderColor={moicColor(moic)}
        sub="Multiple investisseur"
        extra={<div style={{ fontSize: 11, color: '#94a3b8' }}>Exit {fX(inp.multiple)} EBITDA · {inp.dureeS} ans dette</div>}
      />

      {/* IRR */}
      <HeroMetricCard
        label="IRR estimé"
        value={fP(irr)}
        color={irrColor(irr)}
        borderColor={irrColor(irr)}
        sub="Sur 5 ans · TRI net"
        extra={<div style={{ fontSize: 11, color: '#94a3b8' }}>{irr >= 20 ? '↑ Top quartile LBO PME' : irr >= 15 ? '→ Dans la norme marché' : '↓ En dessous du marché'}</div>}
      />
    </div>
  )
}

function AnalysisBar({ inp, c }) {
  const factors = scoreFactors(c, inp.growth)
  return (
    <div style={{
      display: 'flex',
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,.06)',
    }}>
      {factors.map((f, i) => (
        <div key={i} style={{
          flex: 1,
          padding: '10px 16px',
          borderRight: i < factors.length - 1 ? '1px solid #e2e8f0' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            fontSize: 15, flexShrink: 0,
            color: f.ok ? '#16a34a' : f.warn ? '#d97706' : '#dc2626',
          }}>
            {f.ok ? '✓' : f.warn ? '⚠' : '✗'}
          </span>
          <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.3 }}>{f.text}</span>
        </div>
      ))}
    </div>
  )
}

function Secondary({ inp, c }) {
  const fcf1 = c.proj[0]?.fcfNet ?? 0
  const tot  = inp.fp + c.detteSenior + inp.cv || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <SmallMetricCard label="EV / EBITDA"    value={fX(c.evEb)}    color={evColor(c.evEb)}                        sub="Prix payé" />
        <SmallMetricCard label="FCF net Year 1" value={fK(fcf1)}      color={fcf1 >= 0 ? '#16a34a' : '#dc2626'}      sub="Après salaire + dette" />
        <SmallMetricCard label="Marge EBITDA"   value={fP(c.marge*100)} color={c.marge >= .15 ? '#16a34a' : '#dc2626'} sub="> 15% cible mandat" />
        <SmallMetricCard label="Payback dette"  value={fPi(c.payback)} color={c.payback <= 5 ? '#16a34a' : c.payback <= 7 ? '#d97706' : '#dc2626'} sub="Remboursement FCF" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Structure financement */}
        <div className="card" style={{ padding: '16px 18px' }}>
          <div className="sec-label" style={{ marginBottom: 12 }}>Structure financement</div>
          <div style={{ display: 'grid', gridTemplateColumns: inp.cv > 0 ? 'repeat(3,1fr)' : 'repeat(2,1fr)', gap: 12, marginBottom: 12 }}>
            {[
              { label: 'Fonds propres',  val: fK(inp.fp),        pct: fP(inp.fp / tot * 100),        color: '#2563eb', show: true },
              { label: 'Dette senior',   val: fK(c.detteSenior), pct: fP(c.detteSenior / tot * 100), color: '#7c3aed', show: true },
              { label: 'Crédit vendeur', val: fK(inp.cv),        pct: fP(inp.cv / tot * 100),        color: '#059669', show: inp.cv > 0 },
            ].filter(i => i.show).map(({ label, val, pct, color }) => (
              <div key={label} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 10, borderRadius: 0 }}>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{label}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{val}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8' }}>{pct}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', gap: 2 }}>
            <div style={{ flex: inp.fp,        background: '#2563eb', minWidth: 2 }} />
            <div style={{ flex: c.detteSenior, background: '#7c3aed', minWidth: 2 }} />
            {inp.cv > 0 && <div style={{ flex: inp.cv, background: '#059669', minWidth: 2 }} />}
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Annuité totale</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: '#d97706' }}>
              {fK(c.annTot)} · {fP(c.annTot / (c.ebitdaRetraite || 1) * 100)} EBITDA
            </span>
          </div>
        </div>

        {/* Scénario sortie Y5 */}
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span className="sec-label">Scénario sortie Y5</span>
            <span style={{ fontSize: 11, color: '#2563eb', fontFamily: 'var(--mono)', fontWeight: 700 }}>{fX(inp.multiple)} EBITDA</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'EBITDA Y5',          val: fK(c.eb5),        color: '#16a34a' },
              { label: 'EV sortie',          val: fK(c.vSortie),    color: '#0f172a' },
              { label: '− Dette résiduelle', val: fK(c.detteResid), color: '#dc2626' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color }}>{val}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Équité Y5</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{fK(c.vEquite)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default { Hero, Secondary, AnalysisBar }