import { useState } from 'react'
import { fK, fP, SECTOR_BENCHMARKS, calcPrequalif } from './finance.js'

function NumberField({ label, value, onChange, step, suffix }) {
  const [focused, setFocused] = useState(false)
  const display = focused
    ? value.toString()
    : Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  return (
    <div className="field">
      <label>{label}</label>
      <div className="field-row">
        <input type="text" value={display}
          onFocus={e => { setFocused(true); setTimeout(() => e.target.select(), 0) }}
          onBlur={() => setFocused(false)}
          onChange={e => {
            const raw = e.target.value.replace(/[\u00a0\s]/g, '').replace(',', '.')
            const num = parseFloat(raw)
            if (!isNaN(num)) onChange({ target: { value: num, type: 'number' } })
          }} />
        {suffix && <span>{suffix}</span>}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, step, suffix, type = 'number' }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="field-row">
        <input type={type} value={value} onChange={onChange} step={step} />
        {suffix && <span>{suffix}</span>}
      </div>
    </div>
  )
}

export default function InputPanel({ inp, onChange, c }) {
  const [openAB, setOpenAB] = useState(false)

  const u = k => e =>
    onChange(k, e.target.type === 'text' ? e.target.value : parseFloat(e.target.value) || 0)

  const updateAB = (id, val) =>
    onChange('addbacks', inp.addbacks.map(a => a.id === id ? { ...a, amount: parseFloat(val) || 0 } : a))

  const updateTC = k => e =>
    onChange('transactionCosts', { ...inp.transactionCosts, [k]: parseFloat(e.target.value) || 0 })

  const pq = calcPrequalif(inp.ca, inp.secteur)
  const isPrequalMode = inp.ebitda < 50000
  const bm = pq?.bm

  const verdictColor = v => v === 'go' ? '#16a34a' : v === 'watch' ? '#d97706' : '#dc2626'
  const verdictBg    = v => v === 'go' ? '#f0fdf4' : v === 'watch' ? '#fffbeb' : '#fef2f2'
  const verdictLabel = v => v === 'go' ? '✓ Dans la cible' : v === 'watch' ? '⚠ Limite — à vérifier' : '✗ Hors cible mandat'

  return (
    <div className="card" style={{ padding: '18px 20px', alignSelf: 'start' }}>
      <div className="sec-label" style={{ marginBottom: 14 }}>Paramètres du deal</div>

      {/* ── Secteur ── */}
      <div className="divider" style={{ marginTop: 0 }} />
      <div className="sec-label" style={{ marginBottom: 8, color: '#2563eb' }}>Secteur</div>
      <div className="field">
        <label>Secteur cible</label>
        <select
          value={inp.secteur}
          onChange={e => onChange('secteur', e.target.value)}
          style={{ width: '100%', fontFamily: 'var(--sans)', fontSize: 12, padding: '6px 8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--card2)', color: 'var(--t1)', outline: 'none' }}
        >
          <option value="">— Sélectionner un secteur</option>
          {Object.entries(SECTOR_BENCHMARKS).map(([key, bm]) => (
            <option key={key} value={key}>{bm.label}</option>
          ))}
        </select>
      </div>

      {/* ── Préqualif banner ── */}
      {pq && (
        <div style={{ background: verdictBg(pq.verdict), border: `1px solid ${verdictColor(pq.verdict)}33`, borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: verdictColor(pq.verdict) }}>
              {verdictLabel(pq.verdict)}
            </span>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Benchmarks {bm.label.split('(')[0].trim()}</span>
          </div>

          {isPrequalMode ? (
            // Mode préqualif : EBITDA estimé depuis CA
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#64748b' }}>EBITDA estimé (marge {fP(bm.margeMin * 100)}–{fP(bm.margeMax * 100)})</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: pq.ebitdaOk ? '#16a34a' : '#dc2626' }}>
                  {fK(pq.ebitdaMin)} – {fK(pq.ebitdaMax)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#64748b' }}>EV estimée ({bm.evMin}–{bm.evMax}× EBITDA)</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: pq.evOk ? '#16a34a' : '#dc2626' }}>
                  {fK(pq.evMin)} – {fK(pq.evMax)}
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, fontStyle: 'italic' }}>
                {bm.note}
              </div>
            </div>
          ) : (
            // Mode comparaison : EBITDA renseigné vs benchmark
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#64748b' }}>Marge actuelle</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>
                  <span style={{ color: c.marge >= bm.margeMin ? '#16a34a' : '#dc2626' }}>{fP(c.marge * 100)}</span>
                  <span style={{ color: '#94a3b8' }}> vs {fP(bm.margeMin * 100)}–{fP(bm.margeMax * 100)} secteur</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#64748b' }}>Multiple EV/EBITDA</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>
                  <span style={{ color: c.evEb <= bm.evMax ? '#16a34a' : '#dc2626' }}>{fP ? c.evEb.toFixed(1) + '×' : '—'}</span>
                  <span style={{ color: '#94a3b8' }}> vs {bm.evMin}–{bm.evMax}× secteur</span>
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, fontStyle: 'italic' }}>{bm.note}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Financials ── */}
      <div className="divider" />
      <div className="sec-label" style={{ marginBottom: 8, color: '#2563eb' }}>Financials</div>
      <NumberField label="Chiffre d'affaires (€)" value={inp.ca}    onChange={u('ca')}    step="50000" />
      <NumberField label="EBITDA déclaré (€)"     value={inp.ebitda} onChange={u('ebitda')} step="10000" />
      <NumberField label="Prix acquisition EV (€)" value={inp.ev}   onChange={u('ev')}    step="50000" />

      {/* ── Retraitements ── */}
      <div className="divider" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="sec-label" style={{ color: '#2563eb' }}>Retraitements EBITDA</span>
        <button onClick={() => setOpenAB(v => !v)} style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {openAB ? '▲ réduire' : '▼ afficher'}
        </button>
      </div>
      {openAB && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
          {inp.addbacks.map(ab => (
            <div key={ab.id} className="field" style={{ marginBottom: 8 }}>
              <label>{ab.label}</label>
              <div className="field-row">
                <input type="number" value={ab.amount} step="1000"
                  onChange={e => updateAB(ab.id, e.target.value)} />
                <span>€</span>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #e2e8f0', marginTop: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>EBITDA retraité</span>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14, color: '#16a34a' }}>{fK(c.ebitdaRetraite)}</span>
          </div>
        </div>
      )}

      {/* ── Financement ── */}
      <div className="divider" />
      <div className="sec-label" style={{ marginBottom: 8, color: '#2563eb' }}>Financement</div>
      <NumberField label="Fonds propres Ludovic (€)" value={inp.fp}    onChange={u('fp')}    step="10000" />
      <NumberField label="Crédit vendeur (€)"        value={inp.cv}    onChange={u('cv')}    step="10000" />
      <Field label="Taux dette senior"  value={inp.tauxS}  onChange={u('tauxS')}  step="0.1" suffix="%" />
      <Field label="Durée dette (ans)"  value={inp.dureeS} onChange={u('dureeS')} step="1" />
      {inp.cv > 0 && <>
        <Field label="Taux crédit vendeur" value={inp.tauxCV}  onChange={u('tauxCV')}  step="0.1" suffix="%" />
        <Field label="Durée CV (ans)"      value={inp.dureeCV} onChange={u('dureeCV')} step="1" />
      </>}

      {/* Frais de transaction */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
        <div className="sec-label" style={{ marginBottom: 8, fontSize: 10 }}>Frais de transaction</div>
        {[['avocat','Avocat'],['audit','Audit / DD'],['broker','Broker'],['autres','Autres']].map(([k,l]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: '#475569', flex: 1 }}>{l}</label>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', width: 130 }}>
              <input type="number" value={inp.transactionCosts[k]} step="1000" onChange={updateTC(k)} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>€</span>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #e2e8f0', marginTop: 4 }}>
          <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>FP nets disponibles</span>
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13, color: c.fpNets < 400000 ? '#d97706' : '#0f172a' }}>{fK(c.fpNets)}</span>
        </div>
      </div>

      {/* ── Sortie ── */}
      <div className="divider" />
      <div className="sec-label" style={{ marginBottom: 8, color: '#2563eb' }}>Sortie</div>
      <Field label="Croissance CA/an" value={inp.growth}   onChange={u('growth')}   step="0.5" suffix="%" />
      <Field label="Salaire Baptiste" value={inp.salaire}  onChange={u('salaire')}  step="5000" suffix="€/an" />
      <Field label="Taux IS"          value={inp.tis}      onChange={u('tis')}      step="1"   suffix="%" />
      <Field label="Multiple sortie Y5" value={inp.multiple} onChange={u('multiple')} step="0.5" suffix="× EBITDA" />
    </div>
  )
}