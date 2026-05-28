import XLSX from 'xlsx-js-style'
import { sensitivityMatrix, calcScenarios, pmt } from './finance.js'

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  title:    { font: { bold: true, sz: 13, color: { rgb: '0F172A' } } },
  section:  { font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1E293B' } } },
  colH:     { font: { bold: true, sz: 10, color: { rgb: '64748B' } }, fill: { fgColor: { rgb: 'F8FAFC' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'thin', color: { rgb: 'CBD5E1' } } } },
  label:    { font: { sz: 10, color: { rgb: '475569' } } },
  right:    { font: { sz: 10, color: { rgb: '0F172A' } }, alignment: { horizontal: 'right' } },
  bold:     { font: { bold: true, sz: 11, color: { rgb: '0F172A' } }, alignment: { horizontal: 'right' } },
  boldBg:   { font: { bold: true, sz: 11, color: { rgb: '0F172A' } }, fill: { fgColor: { rgb: 'F8FAFC' } }, alignment: { horizontal: 'right' } },
  green:    { font: { bold: true, sz: 10, color: { rgb: '15803D' } }, alignment: { horizontal: 'right' } },
  greenBg:  { font: { bold: true, sz: 11, color: { rgb: '15803D' } }, fill: { fgColor: { rgb: 'F8FAFC' } }, alignment: { horizontal: 'right' } },
  red:      { font: { bold: true, sz: 10, color: { rgb: 'DC2626' } }, alignment: { horizontal: 'right' } },
  amber:    { font: { bold: true, sz: 10, color: { rgb: '92400E' } }, alignment: { horizontal: 'right' } },
  muted:    { font: { sz: 10, color: { rgb: '94A3B8' } }, alignment: { horizontal: 'right' } },
  note:     { font: { sz: 9,  color: { rgb: '94A3B8' } } },
  sensGreen:  { font: { bold: true, sz: 10, color: { rgb: '15803D' } }, fill: { fgColor: { rgb: 'F0FDF4' } }, alignment: { horizontal: 'center' }, border: { top: { style: 'thin', color: { rgb: 'BBF7D0' } }, bottom: { style: 'thin', color: { rgb: 'BBF7D0' } }, left: { style: 'thin', color: { rgb: 'BBF7D0' } }, right: { style: 'thin', color: { rgb: 'BBF7D0' } } } },
  sensAmber:  { font: { bold: true, sz: 10, color: { rgb: '92400E' } }, fill: { fgColor: { rgb: 'FFFBEB' } }, alignment: { horizontal: 'center' }, border: { top: { style: 'thin', color: { rgb: 'FDE68A' } }, bottom: { style: 'thin', color: { rgb: 'FDE68A' } }, left: { style: 'thin', color: { rgb: 'FDE68A' } }, right: { style: 'thin', color: { rgb: 'FDE68A' } } } },
  sensRed:    { font: { bold: true, sz: 10, color: { rgb: '991B1B' } }, fill: { fgColor: { rgb: 'FEF2F2' } }, alignment: { horizontal: 'center' }, border: { top: { style: 'thin', color: { rgb: 'FECACA' } }, bottom: { style: 'thin', color: { rgb: 'FECACA' } }, left: { style: 'thin', color: { rgb: 'FECACA' } }, right: { style: 'thin', color: { rgb: 'FECACA' } } } },
  sensBase:   { font: { bold: true, sz: 11, color: { rgb: '1D4ED8' } }, fill: { fgColor: { rgb: 'DBEAFE' } }, alignment: { horizontal: 'center' }, border: { top: { style: 'medium', color: { rgb: '2563EB' } }, bottom: { style: 'medium', color: { rgb: '2563EB' } }, left: { style: 'medium', color: { rgb: '2563EB' } }, right: { style: 'medium', color: { rgb: '2563EB' } } } },
}

// ── Cell helpers ─────────────────────────────────────────────────────────────
const n  = (v, style = S.right, fmt = '#,##0') => ({ v, t: 'n', s: style, z: fmt })
const tx = (v, style = S.label)                => ({ v, t: 's', s: style })
const e  = ()                                  => ({ v: '', t: 's', s: {} })

const dscrStyle = (d, isBase) =>
  isBase ? S.sensBase : d >= 1.5 ? S.sensGreen : d >= 1.25 ? S.sensAmber : S.sensRed

const scoreStyle = s => s >= 75 ? S.green : s >= 50 ? S.amber : S.red
const dscrValStyle = d => d >= 1.5 ? S.green : d >= 1.25 ? S.amber : S.red
const moicStyle   = m => m >= 2   ? S.green : m >= 1.5  ? S.amber : S.red
const irrStyle    = i => i >= 20  ? S.green : i >= 15   ? S.amber : S.red

// ── Sheet 1 : Synthèse ───────────────────────────────────────────────────────
function buildSynthese(inp, c) {
  const { ebitdaRetraite, totalAddbacks, fpNets, detteSenior, annTot,
          dscr, moic, irr, score, evEb, marge, vSortie, vEquite, eb5, detteResid } = c
  const fcf1 = c.proj[0]?.fcfNet ?? 0
  const tot  = inp.fp + detteSenior + inp.cv || 1
  const scoreLabel = score >= 75 ? 'GO — RECOMMANDÉ' : score >= 50 ? 'WATCH' : 'NO-GO'

  const rows = [
    [tx('OC TRANSMISSION — DEAL MODELER', S.title), e(), e(), e()],
    [tx(inp.name, { font: { bold: true, sz: 12, color: { rgb: '0F172A' } } }), e(), tx(new Date().toLocaleDateString('fr-FR'), S.muted), e()],
    [e()],

    [tx('MÉTRIQUES CLÉS', S.section), tx('', S.section), tx('', S.section), tx('', S.section)],
    [tx('Deal Score',    S.label), n(Math.round(score), scoreStyle(score),   '0"/100"'), tx(scoreLabel, scoreStyle(score)), e()],
    [tx('DSCR Year 1',  S.label), n(dscr,  dscrValStyle(dscr),  '0.00"×"'), tx('≥ 1.25× requis banque', S.muted), e()],
    [tx('MOIC estimé Y5',S.label),n(moic,  moicStyle(moic),     '0.00"×"'), tx('Multiple investisseur', S.muted), e()],
    [tx('IRR estimé Y5', S.label),n(irr/100, irrStyle(irr),      '0.0%'),   tx('TRI net sur 5 ans',     S.muted), e()],
    [tx('EV / EBITDA',  S.label), n(evEb,  evEb<=4?S.green:evEb<=5?S.amber:S.red, '0.00"×"'), tx('Prix payé', S.muted), e()],
    [tx('FCF net Y1',   S.label), n(fcf1,  fcf1>=0?S.green:S.red, '#,##0 "€"'), tx('Après salaire + dette', S.muted), e()],
    [tx('Marge EBITDA', S.label), n(marge, marge>=.15?S.green:S.red, '0.0%'), tx('> 15% cible mandat', S.muted), e()],
    [e()],

    [tx('STRUCTURE FINANCEMENT', S.section), tx('', S.section), tx('', S.section), tx('', S.section)],
    [tx('Fonds propres Ludovic', S.label), n(inp.fp,       S.bold,  '#,##0 "€"'), n(inp.fp/tot,       S.muted, '0.0%'), e()],
    [tx('Dette senior',          S.label), n(detteSenior,  S.bold,  '#,##0 "€"'), n(detteSenior/tot,  S.muted, '0.0%'), e()],
    ...(inp.cv > 0 ? [[tx('Crédit vendeur', S.label), n(inp.cv, S.bold, '#,##0 "€"'), n(inp.cv/tot, S.muted, '0.0%'), e()]] : []),
    [tx('Annuité totale / an',   S.label), n(annTot,       S.amber, '#,##0 "€"'), n(annTot/(ebitdaRetraite||1), S.amber, '0.0%'), tx('% EBITDA retraité', S.muted)],
    [e()],

    [tx('PARAMÈTRES DU DEAL', S.section), tx('', S.section), tx('', S.section), tx('', S.section)],
    [tx("Chiffre d'affaires",   S.label), n(inp.ca,          S.right, '#,##0 "€"'), e(), e()],
    [tx('EBITDA déclaré',       S.label), n(inp.ebitda,       S.right, '#,##0 "€"'), e(), e()],
    ...(totalAddbacks > 0 ? [[tx('EBITDA retraité', S.label), n(ebitdaRetraite, S.green, '#,##0 "€"'), n(totalAddbacks, S.green, '"+"+#,##0 "€"'), tx('add-backs', S.muted)]] : []),
    [tx('Prix acquisition EV',  S.label), n(inp.ev,           S.right, '#,##0 "€"'), e(), e()],
    [tx('Taux dette senior',    S.label), n(inp.tauxS/100,    S.right, '0.0%'),       e(), e()],
    [tx('Durée dette',          S.label), n(inp.dureeS,        S.right, '0 "ans"'),   e(), e()],
    [tx('Croissance CA/an',     S.label), n(inp.growth/100,   S.right, '0.0%'),       e(), e()],
    [tx('Salaire Baptiste',     S.label), n(inp.salaire,       S.right, '#,##0 "€/an"'), e(), e()],
    [tx('Multiple sortie Y5',   S.label), n(inp.multiple,      S.right, '0.0"× EBITDA"'), e(), e()],
    [e()],

    [tx('SCÉNARIO SORTIE Y5', S.section), tx('', S.section), tx('', S.section), tx('', S.section)],
    [tx('EBITDA Y5',           S.label), n(eb5,       S.green, '#,##0 "€"'), e(), e()],
    [tx('EV sortie',           S.label), n(vSortie,   S.bold,  '#,##0 "€"'), e(), e()],
    [tx('Dette résiduelle Y5', S.label), n(detteResid,S.red,   '#,##0 "€"'), e(), e()],
    [tx('Équité Y5',           S.label), n(vEquite,   S.green, '#,##0 "€"'), e(), e()],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 26 }, { wch: 18 }, { wch: 18 }, { wch: 20 }]
  return ws
}

// ── Sheet 2 : Projections P&L ────────────────────────────────────────────────
function buildPL(inp, c) {
  const { proj, totalAddbacks } = c
  const label = totalAddbacks > 0 ? 'EBITDA retraité' : 'EBITDA'

  const rows = [
    [tx('PROJECTIONS 5 ANS', S.title), e(), e(), e(), e(), e()],
    [e()],
    [tx('Indicateur', S.colH), ...proj.map(p => tx(`Year ${p.yr}`, S.colH))],

    [tx("Chiffre d'affaires", S.label), ...proj.map(p => n(p.ca,  S.right,   '#,##0 "€"'))],
    [tx(label,  { font: { bold: true, sz: 11, color: { rgb: '0F172A' } } }), ...proj.map(p => n(p.eb,  S.greenBg, '#,##0 "€"'))],
    [tx('  Marge EBITDA', S.label), ...proj.map(p => n(p.mg, S.muted, '0.0%'))],
    [tx('Intérêts',       S.label), ...proj.map(p => n(-p.intTot, S.red,   '#,##0 "€";(#,##0 "€");-'))],
    [tx('Remboursement',  S.label), ...proj.map(p => n(-p.rmbTot, S.right, '#,##0 "€";(#,##0 "€");-'))],
    [tx('IS',             S.label), ...proj.map(p => n(-p.isN,   S.amber, '#,##0 "€";(#,##0 "€");-'))],
    [tx('FCF brut',       S.label), ...proj.map(p => n(p.fcfBrut, S.right, '#,##0 "€"'))],
    [tx('Salaire Baptiste',S.label),...proj.map(() => n(-inp.salaire, S.muted, '#,##0 "€";(#,##0 "€");-'))],

    [tx('─────', { font: { color: { rgb: 'CBD5E1' } } }), e(), e(), e(), e(), e()],

    [tx('FCF net', { font: { bold: true, sz: 11, color: { rgb: '0F172A' } } }),
      ...proj.map(p => n(p.fcfNet, p.fcfNet >= 0 ? S.greenBg : { font: { bold: true, sz: 11, color: { rgb: 'DC2626' } }, fill: { fgColor: { rgb: 'F8FAFC' } }, alignment: { horizontal: 'right' } }, '#,##0 "€"'))],
    [tx('DSCR', S.label), ...proj.map(p => n(p.dscrN, dscrValStyle(p.dscrN), '0.00"×"'))],
    [tx('Dette résiduelle', S.label), ...proj.map(p => n(p.soldeDette, S.muted, '#,##0 "€"'))],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }]
  return ws
}

// ── Sheet 3 : Debt Schedule ──────────────────────────────────────────────────
function buildDebtSchedule(inp, c) {
  const { detteSenior } = c
  const annSenior = detteSenior > 0 ? pmt(inp.tauxS / 100, inp.dureeS, detteSenior) : 0

  const rows = [
    [tx('DEBT SCHEDULE', S.title), e(), e(), e(), e(), e()],
    [e()],
    [tx('Année', S.colH), tx('Solde début', S.colH), tx('Intérêts', S.colH), tx('Remboursement', S.colH), tx('Solde fin', S.colH), tx('Annuité', S.colH)],
  ]

  // Years from projections (1-5)
  let solDebut = detteSenior + inp.cv
  for (const p of c.proj) {
    rows.push([
      tx(`Année ${p.yr}`, S.label),
      n(solDebut,    S.right, '#,##0 "€"'),
      n(p.intTot,    S.red,   '#,##0 "€"'),
      n(p.rmbTot,    S.right, '#,##0 "€"'),
      n(p.soldeDette,p.soldeDette <= 0 ? S.green : S.right, '#,##0 "€"'),
      n(p.annN,      S.amber, '#,##0 "€"'),
    ])
    solDebut = p.soldeDette
  }

  // Remaining years (6 → dureeS) if needed
  let solD = c.proj[4].soldeDette
  for (let yr = 6; yr <= inp.dureeS && solD > 0; yr++) {
    const intS = solD * (inp.tauxS / 100)
    const rmb  = Math.min(annSenior - intS, solD)
    const solF = Math.max(0, solD - rmb)
    rows.push([
      tx(`Année ${yr}`, S.label),
      n(solD, S.right, '#,##0 "€"'),
      n(intS, S.red,   '#,##0 "€"'),
      n(rmb,  S.right, '#,##0 "€"'),
      n(solF, solF <= 0 ? S.green : S.right, '#,##0 "€"'),
      n(annSenior, S.amber, '#,##0 "€"'),
    ])
    solD = solF
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 }]
  return ws
}

// ── Sheet 4 : Sensibilité ────────────────────────────────────────────────────
function buildSensitivity(inp, c) {
  const { ebVars, evVars, matrix } = sensitivityMatrix(inp, c)

  const colColor = p => p === 0 ? '2563EB' : p < 0 ? '15803D' : 'DC2626'
  const rowColor = p => p === 0 ? '2563EB' : p < 0 ? 'DC2626' : '15803D'

  const rows = [
    [tx('SENSIBILITÉ DSCR YEAR 1', S.title), e(), e(), e(), e(), e()],
    [tx("Lignes : variation EBITDA retraité — Colonnes : variation prix d'acquisition (EV)", S.note), e(), e(), e(), e(), e()],
    [e()],
    [
      tx('EBITDA \\ Prix', S.colH),
      ...evVars.map(p => tx(p === 0 ? 'BASE' : `${p > 0 ? '+' : ''}${p}%`, { ...S.colH, font: { bold: true, sz: 10, color: { rgb: colColor(p) } }, fill: { fgColor: { rgb: 'F8FAFC' } } })),
    ],
    ...ebVars.map((ebPct, ri) => [
      tx(ebPct === 0 ? 'BASE' : `${ebPct > 0 ? '+' : ''}${ebPct}%`, { font: { bold: true, sz: 10, color: { rgb: rowColor(ebPct) } }, alignment: { horizontal: 'left' } }),
      ...matrix[ri].map((dscr, ci) => n(dscr, dscrStyle(dscr, ebPct === 0 && evVars[ci] === 0), '0.00"×"')),
    ]),
    [e()],
    [tx('≥ 1.50× : bancable — confort',    { font: { sz: 9, color: { rgb: '15803D' } } })],
    [tx('1.25–1.50× : bancable — limite',  { font: { sz: 9, color: { rgb: '92400E' } } })],
    [tx('< 1.25× : non bancable',          { font: { sz: 9, color: { rgb: '991B1B' } } })],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }]
  return ws
}

// ── Sheet 5 : Scénarios ──────────────────────────────────────────────────────
function buildScenarios(inp, c) {
  const scenarios = calcScenarios(inp, c)
  const scColor = s => s.label === 'Pessimiste' ? 'DC2626' : s.label === 'Base' ? '2563EB' : '15803D'
  const scBg    = s => s.label === 'Pessimiste' ? 'FEF2F2' : s.label === 'Base' ? 'EFF6FF' : 'F0FDF4'

  const colH = [
    tx('Métrique', S.colH),
    ...scenarios.map(s => tx(s.label.toUpperCase(), {
      font: { bold: true, sz: 11, color: { rgb: scColor(s) } },
      fill: { fgColor: { rgb: scBg(s) } },
      alignment: { horizontal: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'CBD5E1' } } },
    })),
  ]

  const rows = [
    [tx('ANALYSE DE SCÉNARIOS', S.title), e(), e(), e()],
    [e()],
    colH,
    [
      tx('Hypothèses', S.label),
      ...scenarios.map(s => tx(`Croissance ${inp.growth + s.growthDelta}% · Marge ${(s.sc.marge * 100).toFixed(1)}%`, S.note)),
    ],
    [e()],
    [tx('Deal Score', S.label),      ...scenarios.map(s => n(Math.round(s.sc.score), scoreStyle(s.sc.score),     '0"/100"'))],
    [tx('Verdict',    S.label),      ...scenarios.map(s => tx(s.sc.score >= 75 ? 'GO' : s.sc.score >= 50 ? 'WATCH' : 'NO-GO', scoreStyle(s.sc.score)))],
    [tx('DSCR Year 1',S.label),      ...scenarios.map(s => n(s.sc.dscr,               dscrValStyle(s.sc.dscr),  '0.00"×"'))],
    [tx('FCF net Y1', S.label),      ...scenarios.map(s => { const v = s.sc.proj[0]?.fcfNet ?? 0; return n(v, v >= 0 ? S.green : S.red, '#,##0 "€"') })],
    [tx('MOIC Y5',    S.label),      ...scenarios.map(s => n(s.sc.moic, moicStyle(s.sc.moic), '0.00"×"'))],
    [tx('IRR estimé', S.label),      ...scenarios.map(s => n(s.sc.irr / 100, irrStyle(s.sc.irr), '0.0%'))],
    [tx('Payback dette', S.label),   ...scenarios.map(s => { const p = s.sc.ebitdaRetraite > 0 ? s.sc.detteSenior / s.sc.ebitdaRetraite : 999; return n(p, p <= 4 ? S.green : p <= 6 ? S.amber : S.red, '0.0 "ans"') })],
    [e()],
    [tx('Pessimiste : −2pp croissance, −3pp marge vs scénario base', S.note)],
    [tx('Optimiste : +2pp croissance, +3pp marge vs scénario base',  S.note)],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]
  return ws
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function exportToExcel(inp, c) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildSynthese(inp, c),    'Synthèse')
  XLSX.utils.book_append_sheet(wb, buildPL(inp, c),          'Projections P&L')
  XLSX.utils.book_append_sheet(wb, buildDebtSchedule(inp, c),'Debt Schedule')
  XLSX.utils.book_append_sheet(wb, buildSensitivity(inp, c), 'Sensibilité DSCR')
  XLSX.utils.book_append_sheet(wb, buildScenarios(inp, c),   'Scénarios')

  const date = new Date().toISOString().slice(0, 10)
  const name = (inp.name || 'Deal').replace(/[^a-zA-Z0-9_-]/g, '_')
  XLSX.writeFile(wb, `${name}_Modeler_${date}.xlsx`)
}