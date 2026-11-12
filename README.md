# WealthTrack

A responsive, browser-based wealth projection and financial independence dashboard. WealthTrack uses vanilla TypeScript (no application framework); all calculations and data storage run in the visitor's browser.

## Technology

- **HTML** for page structure.
- **CSS** for responsive styling.
- **Vanilla TypeScript** for user input, calculations, local storage, and interactions.
- **Chart.js** for the portfolio projection chart.
- **esbuild** to bundle TypeScript for browsers.
- **GitHub Pages** for static website hosting.
- **GitHub Actions** to automatically deploy the website.

There is no backend server or database. Node.js is used only for development and building the static site.

## Features

- Portfolio projection from starting balance and monthly contributions.
- Adjustable annual return, inflation, time horizon, and annual contribution increases.
- Portfolio versus contributions line chart.
- Nominal and inflation-adjusted future values.
- Financial independence target, estimated time to FI, and illustrative withdrawals.
- Conservative (4%), baseline (selected return), and optimistic (10%) scenarios.
- CAD, USD, EUR, and GBP display formatting.
- Saves assumptions in browser `localStorage`; no account or database.

## Project structure

```text
src/
  app.ts             Application events and dashboard rendering
  calculations.ts    Portfolio projections and FI calculations
  chart.ts           Chart.js integration
  storage.ts         Defaults and browser localStorage
  types.ts           Shared TypeScript types
assets/
  styles.css         Responsive application styling
index.html           Static page structure
```

## Run locally

Install dependencies, type-check, and build the site:

```bash
npm install
npm run typecheck
npm run build
```

The build outputs a ready-to-serve static site in `dist/`. Preview it locally with:

```bash
npx serve dist
```

## Deploy to GitHub Pages

1. Push this repository to GitHub on the `main` branch.
2. In repository **Settings → Pages**, set the source to **GitHub Actions**.
3. Push a commit to `main`, or manually run **Deploy WealthTrack** under the Actions tab.
4. GitHub Actions installs dependencies, type-checks and bundles the app, then deploys `dist/`.

## Calculation assumptions and limitations

- Annual return is converted to an equivalent effective monthly rate.
- Contributions are added at each month's end.
- Contribution increases are applied at the start of each calendar year.
- Inflation adjustment discounts the future nominal value by `(1 + inflation)^years`.
- FI target = desired annual spending / withdrawal rate.
- FI date is estimated by extending the selected return and contribution assumptions monthly, for up to 100 years.
- Taxes, fees, withdrawals before FI, volatility, sequence-of-returns risk, and changing spending are not modeled.
- The selected withdrawal rate is an assumption, not a safe-withdrawal guarantee.

This is an educational illustration, not financial advice or a forecast.