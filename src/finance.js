export function pmt(rate, nper, pv) {
  if (!pv || !nper) return 0
  if (!rate) return pv / nper
  return (pv * rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1)
}

export function sensitivityMatrix(inp, c) {
  const ebVars = [-20, -10, 0, 10, 20]
  const evVars = [-20, -10, 0, 10, 20]

  const matrix = ebVars.map(ebPct =>
    evVars.map(evPct => {
      const evV  = inp.ev * (1 + evPct / 100)
      const ebV  = c.ebitdaRetraite * (1 + ebPct / 100)
      const dS   = Math.max(0, evV - c.fpNets - inp.cv)
      const aS   = dS > 0 ? pmt(inp.tauxS / 100, inp.dureeS, dS) : 0
      const aCV  = inp.cv > 0 ? pmt(inp.tauxCV / 100, inp.dureeCV, inp.cv) : 0
      const aTot = aS + aCV
      return aTot > 0 ? ebV / aTot : 999
    })
  )
  return { ebVars, evVars, matrix }
}

export function calcScenarios(inp, baseCalc) {
  const { marge, totalAddbacks } = baseCalc

  const make = (growthDelta, margeDelta) => {
    const newMarge  = Math.max(0.05, marge + margeDelta)
    const newEbitda = Math.max(0, inp.ca * newMarge - totalAddbacks)
    return calculate({ ...inp, growth: inp.growth + growthDelta, ebitda: newEbitda })
  }

  return [
    { label: 'Pessimiste', sc: make(-2, -0.03), color: '#dc2626', bg: '#fef2f2', growthDelta: -2, margeDelta: -3 },
    { label: 'Base',       sc: baseCalc,         color: '#2563eb', bg: '#eff6ff', growthDelta:  0, margeDelta:  0 },
    { label: 'Optimiste',  sc: make(+2, +0.03),  color: '#16a34a', bg: '#f0fdf4', growthDelta: +2, margeDelta: +3 },
  ]
}

export function scoreFactors(c, growth) {
  return [
    {
      ok: c.dscr >= 1.5,
      warn: c.dscr >= 1.25 && c.dscr < 1.5,
      text: c.dscr >= 1.5
        ? `DSCR ${fX(c.dscr)} — couverture dette solide`
        : c.dscr >= 1.25
        ? `DSCR ${fX(c.dscr)} — acceptable mais marge faible vs seuil bancaire`
        : `DSCR ${fX(c.dscr)} — insuffisant, banque refusera probablement`,
    },
    {
      ok: c.evEb <= 4,
      warn: c.evEb > 4 && c.evEb <= 5,
      text: c.evEb <= 4
        ? `EV/EBITDA ${fX(c.evEb)} — valorisation raisonnable`
        : c.evEb <= 5
        ? `EV/EBITDA ${fX(c.evEb)} — valorisation tendue, négocier le prix`
        : `EV/EBITDA ${fX(c.evEb)} — surpayé, deal difficile à justifier`,
    },
    {
      ok: c.marge >= 0.2,
      warn: c.marge >= 0.15 && c.marge < 0.2,
      text: c.marge >= 0.2
        ? `Marge EBITDA ${fP(c.marge * 100)} — marges saines`
        : c.marge >= 0.15
        ? `Marge EBITDA ${fP(c.marge * 100)} — dans la cible, pas de coussin`
        : `Marge EBITDA ${fP(c.marge * 100)} — sous le seuil mandat (15%)`,
    },
    {
      ok: c.moic >= 2,
      warn: c.moic >= 1.5 && c.moic < 2,
      text: c.moic >= 2
        ? `MOIC ${fX(c.moic)} — retour investisseur solide`
        : c.moic >= 1.5
        ? `MOIC ${fX(c.moic)} — retour modeste sur 5 ans`
        : `MOIC ${fX(c.moic)} — retour insuffisant pour justifier le risque`,
    },
    {
      ok: growth >= 3,
      warn: growth >= 1 && growth < 3,
      text: growth >= 3
        ? `Croissance ${fP(growth)} — hypothèse crédible`
        : growth >= 1
        ? `Croissance ${fP(growth)} — faible, upside limité`
        : `Croissance ${fP(growth)} — stagnation, revoir la thèse`,
    },
  ]
}

export const fK = (n) => {
  if (!isFinite(n)) return '—'
  const v = Math.round(n / 1000)
  const abs = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  return (v < 0 ? '-' : '') + abs + 'k€'
}

export const fFull = (n) => {
  if (!isFinite(n)) return '—'
  const v = Math.round(n)
  const abs = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  return (v < 0 ? '-' : '') + abs + '€'
}
export const fP  = (n) => isFinite(n) ? n.toFixed(1) + '%' : '—'
export const fX  = (n) => (!isFinite(n) || n > 99) ? '∞' : n.toFixed(2) + '×'
export const fPi = (n) => isFinite(n) ? n.toFixed(1) + ' ans' : '—'

export const statusColor = (val, thresholds) => {
  for (const [min, color] of thresholds) if (val >= min) return color
  return '#dc2626'
}
export const dscrColor  = (d) => d >= 1.5 ? '#16a34a' : d >= 1.25 ? '#d97706' : '#dc2626'
export const evColor    = (v) => v <= 4   ? '#16a34a' : v <= 5    ? '#d97706' : '#dc2626'
export const moicColor  = (m) => m >= 2   ? '#16a34a' : m >= 1.5  ? '#d97706' : '#dc2626'
export const irrColor   = (i) => i >= 20  ? '#16a34a' : i >= 15   ? '#d97706' : '#dc2626'
export const scoreColor = (s) => s >= 75  ? '#16a34a' : s >= 50   ? '#d97706' : '#dc2626'
export const scoreBg    = (s) => s >= 75  ? '#f0fdf4' : s >= 50   ? '#fffbeb' : '#fef2f2'
export const scoreBorder= (s) => s >= 75  ? '#16a34a' : s >= 50   ? '#d97706' : '#dc2626'

export const DEFAULT_ADDBACKS = [
  { id: 1, label: 'Rémunération dirigeant', amount: 0 },
  { id: 2, label: 'Charges non récurrentes', amount: 0 },
  { id: 3, label: 'Loyer anormal', amount: 0 },
  { id: 4, label: 'Autres retraitements', amount: 0 },
]

export const DEFAULT_TRANSACTION_COSTS = {
  avocat: 15000, audit: 20000, broker: 0, autres: 5000,
}

function subScores(dscr, levier, marge, moic, irr, growth, annTot, ebRetr, fcfY1) {
  const sMoic = moic >= 2.5 ? 13 : moic >= 2 ? 10 : moic >= 1.5 ? 6 : 2
  const sIrr  = irr  >= 25  ? 12 : irr  >= 20 ?  9 : irr  >= 15  ? 5 : 2
  const rentabilite = Math.min(25, sMoic + sIrr)

  const sDscr = dscr   >= 1.5 ? 15 : dscr  >= 1.25 ? 11 : dscr >= 1 ? 6 : 0
  const sLev  = levier <= 3   ? 10 : levier <= 4    ?  7 : levier <= 5 ? 4 : 1
  const solvabilite = Math.min(25, sDscr + sLev)

  const sGrow = growth >= 5   ? 10 : growth >= 3 ?  7 : growth >= 1 ? 4 : 1
  const sMarg = marge  >= .25 ? 15 : marge  >= .2 ? 11 : marge >= .15 ? 7 : 3
  const croissance = Math.min(25, sGrow + sMarg)

  const ratio = ebRetr > 0 ? annTot / ebRetr : 1
  const sAnn  = ratio < .5  ? 10 : ratio < .65 ? 7 : 4
  const sFcf  = fcfY1 > 50000 ? 8 : fcfY1 > 0 ? 5 : 0
  const sLev2 = levier <= 3 ? 7 : levier <= 4 ? 4 : levier <= 5 ? 1 : 0
  const risque = Math.min(25, sAnn + sFcf + sLev2)

  return { rentabilite, solvabilite, croissance, risque, total: rentabilite + solvabilite + croissance + risque }
}

export function calculate(inp) {
  const { ca, ebitda, ev, fp, cv, tauxS, dureeS, tauxCV, dureeCV,
          growth, salaire, tis, multiple, addbacks, transactionCosts } = inp

  const totalAddbacks = addbacks.reduce((s, a) => s + (Number(a.amount) || 0), 0)
  const ebitdaRetraite = ebitda + totalAddbacks
  const totalTC = Object.values(transactionCosts).reduce((s, v) => s + (Number(v) || 0), 0)
  const fpNets = Math.max(0, fp - totalTC)

  const marge = ca > 0 ? ebitdaRetraite / ca : 0
  const evEb  = ebitdaRetraite > 0 ? ev / ebitdaRetraite : 0
  const detteSenior = Math.max(0, ev - fpNets - cv)

  const annSenior = detteSenior > 0 ? pmt(tauxS / 100, dureeS, detteSenior) : 0
  const annCV     = cv > 0 ? pmt(tauxCV / 100, dureeCV, cv) : 0
  const annTot    = annSenior + annCV

  const dscr  = annTot > 0 ? ebitdaRetraite / annTot : 999
  const levier= ebitdaRetraite > 0 ? detteSenior / ebitdaRetraite : 0

  let solSenior = detteSenior, solCV = cv
  const proj = Array.from({ length: 5 }, (_, i) => {
    const yr  = i + 1
    const caN = ca * Math.pow(1 + growth / 100, yr)
    const ebN = caN * marge

    const intS = solSenior * (tauxS / 100)
    const rmbS = yr <= dureeS ? Math.min(annSenior - intS, solSenior) : 0
    solSenior = Math.max(0, solSenior - rmbS)

    const intCV  = solCV * (tauxCV / 100)
    const rmbCV  = cv > 0 && yr <= dureeCV ? Math.min(annCV - intCV, solCV) : 0
    solCV = Math.max(0, solCV - rmbCV)

    const intTot = (yr <= dureeS ? intS : 0) + (cv > 0 && yr <= dureeCV ? intCV : 0)
    const rmbTot = rmbS + rmbCV
    const annN   = intTot + rmbTot
    const soldeDette = solSenior + solCV
    const isN    = Math.max(0, (ebN - intTot) * (tis / 100))
    const fcfBrut = ebN - annN - isN
    const fcfNet  = fcfBrut - salaire
    const dscrN   = annN > 0 ? ebN / annN : 999

    return { yr, ca: caN, eb: ebN, mg: marge, intTot, rmbTot, annN, isN, fcfBrut, fcfNet, soldeDette, dscrN }
  })

  const eb5 = proj[4].eb
  const vSortie = eb5 * multiple
  const detteResid = proj[4].soldeDette
  const vEquite = Math.max(0, vSortie - detteResid)
  const moic = fpNets > 0 ? vEquite / fpNets : 0
  const irr  = moic > 0 ? (Math.pow(moic, 1 / 5) - 1) * 100 : 0

  const avgFcfBrut = proj.reduce((s, p) => s + p.fcfBrut, 0) / 5
  const payback = ebitdaRetraite > 0 ? detteSenior / ebitdaRetraite : 999

  const fcfY1 = proj[0].fcfNet
  const ss = subScores(dscr, levier, marge, moic, irr, growth, annTot, ebitdaRetraite, fcfY1)

  return {
    ebitdaRetraite, totalAddbacks, totalTC, fpNets,
    marge, evEb, detteSenior, annTot, dscr, levier,
    proj, moic, irr, payback, score: ss.total, subScores: ss,
    vSortie, vEquite, eb5, detteResid,
  }
}

export const DEFAULT_INPUTS = {
  name: 'Cible A',
  ca: 2000000, ebitda: 400000, ev: 1800000,
  fp: 500000, cv: 0, tauxS: 5.5, dureeS: 7,
  tauxCV: 2.0, dureeCV: 5, growth: 3,
  salaire: 65000, tis: 25, multiple: 4.5,
  addbacks: DEFAULT_ADDBACKS,
  transactionCosts: DEFAULT_TRANSACTION_COSTS,
}

// Dans DEFAULT_INPUTS, ajoute :
// secteur: '',

export function calcMaxEV(ebitdaRetraite, fpNets, cv, tauxS, dureeS, tauxCV, dureeCV, dscrTarget) {
  if (!ebitdaRetraite || !dscrTarget) return 0
  const annCV = cv > 0 ? pmt(tauxCV / 100, dureeCV, cv) : 0
  const targetAnnSenior = (ebitdaRetraite / dscrTarget) - annCV
  if (targetAnnSenior <= 0) return fpNets + cv
  const r = tauxS / 100
  const n = dureeS
  const maxDette = r === 0
    ? targetAnnSenior * n
    : targetAnnSenior * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n))
  return Math.max(0, maxDette + fpNets + cv)
}

export const SECTOR_BENCHMARKS = {
  biomédical: {
    label: 'Maintenance biomédicale (tierce maintenance)',
    margeMin: 0.18, margeMid: 0.22, margeMax: 0.25,
    evMin: 4.0, evMid: 5.0, evMax: 6.0,
    note: 'Contrats forfaitaires annuels · techniciens Bac+3 · parc multi-clients',
  },
  cvc_sante: {
    label: 'CVC / traitement air / désenfumage santé',
    margeMin: 0.13, margeMid: 0.17, margeMax: 0.21,
    evMin: 3.5, evMid: 4.5, evMax: 5.5,
    note: 'Contrats P2/P3 pluriannuels · qualifications Qualibat 5xx',
  },
  formation: {
    label: 'Formation continue (Qualiopi / DPC)',
    margeMin: 0.22, margeMid: 0.30, margeMax: 0.38,
    evMin: 4.0, evMid: 5.5, evMax: 7.0,
    note: 'Asset-light · DPC obligatoire · forte récurrence réglementaire',
  },
  cyber_dpo: {
    label: 'Cybersécurité / DPO externalisé santé',
    margeMin: 0.20, margeMid: 0.28, margeMax: 0.35,
    evMin: 5.0, evMid: 6.5, evMax: 8.0,
    note: 'Programme CaRE + NIS2 · marché en hyper-croissance · attention aux multiples élevés',
  },
  controles_reglementaires: {
    label: 'Contrôles réglementaires / légionelle / métrologie',
    margeMin: 0.18, margeMid: 0.22, margeMax: 0.26,
    evMin: 4.0, evMid: 5.0, evMax: 6.0,
    note: 'Obligations légales ERP · sanctions pénales · clients captifs',
  },
  maintenance_multisites: {
    label: 'Maintenance multi-sites (élec / plomb / GTB)',
    margeMin: 0.12, margeMid: 0.16, margeMax: 0.20,
    evMin: 3.0, evMid: 4.0, evMax: 5.0,
    note: 'Contrats récurrents · fort potentiel build-up régional Occitanie',
  },
  securite_incendie: {
    label: 'Sécurité incendie (SSI / extincteurs / désenfumage)',
    margeMin: 0.15, margeMid: 0.19, margeMax: 0.24,
    evMin: 3.5, evMid: 4.5, evMax: 5.5,
    note: 'Obligation ERP universelle · récurrence forte · multi-segments',
  },
  saas_sante_hotel: {
    label: 'SaaS B2B santé / hôtellerie (éditeur)',
    margeMin: 0.22, margeMid: 0.30, margeMax: 0.40,
    evMin: 5.0, evMid: 7.0, evMax: 10.0,
    note: 'ARR mensuel · capex faible · attention aux valorisations élevées',
  },
  e_reputation: {
    label: 'E-réputation / revenue management hôtellerie',
    margeMin: 0.20, margeMid: 0.28, margeMax: 0.35,
    evMin: 4.0, evMid: 5.5, evMax: 7.0,
    note: 'Abonnement mensuel · marché atomisé · très forte récurrence',
  },
  maintenance_cuisines: {
    label: 'Maintenance cuisines pro / froid commercial',
    margeMin: 0.14, margeMid: 0.18, margeMax: 0.22,
    evMin: 3.5, evMid: 4.5, evMax: 5.5,
    note: 'HACCP obligatoire · multi-clients hôtels + EHPAD · récurrence forte',
  },
  psad: {
    label: 'PSAD / prestataire santé à domicile',
    margeMin: 0.12, margeMid: 0.17, margeMax: 0.22,
    evMin: 4.0, evMid: 5.0, evMax: 6.5,
    note: 'Certification HAS · LPP récurrente · consolidation en cours (timing serré)',
  },
  nettoyage_hospitalier: {
    label: 'Nettoyage / bionettoyage hospitalier',
    margeMin: 0.08, margeMid: 0.12, margeMax: 0.16,
    evMin: 2.5, evMid: 3.5, evMax: 4.5,
    note: 'Main-d\'œuvre intensive · marges faibles · à éviter sauf niche premium salles propres',
  },
}

export function calcPrequalif(ca, sectorKey) {
  if (!ca || !sectorKey) return null
  const bm = SECTOR_BENCHMARKS[sectorKey]
  if (!bm) return null

  const ebitdaMin = ca * bm.margeMin
  const ebitdaMid = ca * bm.margeMid
  const ebitdaMax = ca * bm.margeMax
  const evMin     = ebitdaMid * bm.evMin
  const evMid     = ebitdaMid * bm.evMid
  const evMax     = ebitdaMid * bm.evMax

  const ebitdaOk   = ebitdaMax >= 300000 && ebitdaMin <= 1000000
  const ebitdaLow  = ebitdaMax < 300000
  const ebitdaHigh = ebitdaMin > 1000000
  const evOk       = evMin <= 3500000 && evMax >= 800000
  const evHigh     = evMin > 3500000
  const evLow      = evMax < 800000

  const verdict = ebitdaOk && evOk ? 'go'
    : ebitdaLow || evLow           ? 'no'
    : 'watch'

  return { bm, ebitdaMin, ebitdaMid, ebitdaMax, evMin, evMid, evMax, ebitdaOk, ebitdaLow, ebitdaHigh, evOk, evHigh, evLow, verdict }
}