# Deal Modeler — Oc Transmission

LBO modeling tool for SME acquisition. Modules: deal screener + 5-year projections.

## Setup local

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy on Netlify (3 minutes)

**Option A — drag & drop (le plus rapide)**

```bash
npm run build
```

Va sur https://app.netlify.com → "Add new site" → "Deploy manually" → glisse le dossier `dist/`

**Option B — via GitHub (recommandé pour les mises à jour)**

1. Push ce repo sur GitHub
2. Va sur https://app.netlify.com → "Add new site" → "Import from Git"
3. Sélectionne le repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy

Netlify détecte Vite automatiquement. Chaque `git push` redéploie.

## Deploy on Vercel

```bash
npm install -g vercel
vercel
```

Suivre les instructions. Auto-détecte Vite.

## Structure

```
src/
  finance.js          — toutes les formules financières (pmt, DSCR, MOIC, score)
  App.jsx             — composant racine + état global
  InputPanel.jsx      — formulaire de saisie
  MetricsPanel.jsx    — métriques temps réel + structure financement + sortie Y5
  ProjectionsPanel.jsx — tableau projections 5 ans + graphique
  index.css           — variables CSS (light/dark mode)
```

## Formules

- **PMT** : annuité constante (dette senior + crédit vendeur séparés)
- **DSCR** : EBITDA / annuité totale
- **MOIC** : valeur equity Y5 (EV sortie - dette résiduelle) / apport FP
- **FCF net** : EBITDA - annuité - IS - salaire Baptiste
- **IS** : (EBITDA - intérêts) × taux (simplifié, pas d'amortissements)
- **Deal score** : DSCR×40% + EV/EBITDA×25% + marge×20% + MOIC×15%

## Ajouter un deal

Les inputs par défaut sont dans `src/finance.js` → `DEFAULT_INPUTS`.
