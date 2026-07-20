# Jobs Guarantee Simulator

**Live at [krcilr-guarantee.netlify.app](https://krcilr-guarantee.netlify.app)**

A free, public, interactive simulator showing how a US national jobs guarantee could work — built on real, cited data. Drag the assumptions yourself, including hostile ones, and watch the program still function. Every scenario you set is shareable as a URL.

**At the cited defaults:** employ **4.5 million people**, cut national unemployment from **4.4% to 1.76%**, for **$191.6B net per year** (0.66% of GDP).

**At deliberately hostile settings** (government efficiency at 130% of private cost, fiscal offsets cut to 15%): still 4.5M people employed, $221.4B net — 0.76% of GDP.

## Try it

The [live site](https://krcilr-guarantee.netlify.app) is the product: a US map of where the jobs land, five cited sliders, and a methodology page generated from the same config the model runs on.

Run it locally:

```
npm install
npm run dev        # dev server
npm test           # full simulation + validation against published benchmarks
npm run build      # static bundle to dist/
```

The engine itself has zero dependencies and runs in Node 20+ unchanged — `npm test` needs no install.

## How it works

- **Pure calculation engine** ([src/engine.js](src/engine.js)) — pure ESM functions, no I/O, no state; the same file runs in Node for testing and in the browser for the app. Primary method follows the Levy Institute approach (workers → costs), cross-checked against a BEA-based method (infrastructure backlog dollars → worker-years via labor shares).
- **Assumptions as config, not code** ([config/assumptions.json](config/assumptions.json)) — every model parameter lives in one file with its citation and slider range. The methodology page renders directly from this file and the datasets' meta blocks, so citations can never drift from the math.
- **Every number is cited** ([data/processed/](data/processed/)) — each dataset carries a `meta` block with source, vintage, and retrieval date. No invented values. See [data/README.md](data/README.md) for the status table.
- **URL-encoded scenarios** — slider state serializes into the query string (`?e=1.3&o=0.15` is the hostile scenario above). Sharing a link shares your exact settings. No accounts, no backend, no database: the whole thing is a static bundle on a CDN.
- **Breakability is a feature.** The efficiency slider goes to 130% of private cost benchmarks *on purpose*. The tool's answer to "government is inefficient" is letting skeptics price in the waste and watch the bottom line.

## Validation

`npm test` checks the model against published benchmarks on every run (and in CI):

- Gross cost per worker-year: **$54,631** — consistent with CBPP 2018 (~$51k) and the Levy Institute band (~$45–55k in 2018 dollars)
- Net cost 0.66% of GDP — below Levy's 0.8–2.0% full-program range, as expected for a smaller-scale program
- Internal consistency (gross − offsets = net) and the hostile-scenario stress test

The work-side cross-check currently reconciles ~3.4M jobs/yr of quantified need (infrastructure + childcare) against the 4.5M program workforce — the honest gap is why the "work pipeline" panel exists.

## Data sources

| Dataset | Source | Status |
|---|---|---|
| State unemployment | BLS LAUS, Apr 2026 | ✅ Done; June refresh due when BLS releases (Jul 21, 2026) |
| Infrastructure gaps | ASCE 2025 Report Card ($9.1T need / $3.7T gap) | ✅ Done, totals verified; state allocation via labor-force-share proxy (documented v1 limitation) |
| Childcare gap | Child Care Gaps Assessment, Sept 2025 (4.2M-slot gap) | 🟡 National done; state-level extraction pending |
| Labor share coefficients | BEA NIPA 6.2D/6.12D + GDP-by-Industry, 2024 | ✅ Exact extraction (construction 0.318; per-series citations in the file) |
| Living wage | Pending license | ⛔ Not included until licensed |

## Stack

Vite + React, d3-geo + us-atlas for the choropleth, self-hosted Public Sans variable font. Static output, ~125 KB gzipped, no runtime requests to any third party. Dark-first with automatic light mode.

Found a number without a source? [File an issue](https://github.com/krcilr/jobs-guarantee-simulator/issues).

## License

MIT — see [LICENSE](LICENSE). Data values remain the property of their cited sources.
