# Jobs Guarantee Simulator

A free, public, interactive simulator showing how a US national jobs guarantee could work — built on real, cited data. Set the assumptions yourself (including hostile ones) and see what the program does.

**Headline at default assumptions:** employ **4.5 million people**, cut national unemployment from **4.3% to 1.76%**, for **$191.6B net per year** (0.66% of GDP).

> **Status: engine + data phase complete, UI in progress.** What's here today is the calculation engine, the datasets, and a validation test suite. The interactive site (US map, sliders, methodology page) is the next build.

## Try it

```
node test/run.js
```

No dependencies, no build step. Requires Node 20+. This runs the full national + state simulation and validates results against published benchmarks.

## How it works

- **Pure calculation engine** ([src/engine.js](src/engine.js)) — pure ESM functions, zero dependencies, runs identically in Node and the browser. Primary method follows the Levy Institute approach (workers → costs), cross-checked against a BEA-based method (infrastructure backlog dollars → worker-years).
- **Assumptions as config, not code** ([config/assumptions.json](config/assumptions.json)) — all 11 model parameters live in one file, each with its citation and slider range. The methodology page will be auto-generated from this file so citations can never drift from the math.
- **Every number is cited** ([data/processed/](data/processed/)) — each dataset carries a `meta` block with source URL, vintage, and retrieval date. No invented values. See [data/README.md](data/README.md) for dataset status; some values are explicitly flagged PRELIMINARY pending exact extractions.
- **Breakability is a feature.** Sliders will have honest hostile ranges — e.g., government efficiency up to 130% of private cost benchmarks. Skeptics can set the sliders against the program and watch it still function.

## Validation

The test suite checks the model against published benchmarks:

- Gross cost per worker-year: **$54,631** — consistent with CBPP 2018 (~$51k) and the Levy Institute band (~$45–55k in 2018 dollars)
- Net cost 0.66% of GDP — below Levy's 0.8–2.0% full-program range, as expected for a smaller-scale program
- Hostile scenario (130% efficiency, offsets cut to 15%): still 4.5M workers at $221B net

## Data sources

| Dataset | Source | Status |
|---|---|---|
| State unemployment | BLS, Apr 2026 | Done, sanity-checked |
| Infrastructure gaps | ASCE ($9.1T need / $3.7T gap) | Done, totals verified |
| Childcare gap | childcaregap.org (4.2M-slot gap) | National done; state-level TODO |
| Labor share coefficients | BEA | Preliminary |
| Living wage | Pending license | Not included until licensed |

## License

MIT — see [LICENSE](LICENSE). Data values remain the property of their cited sources.
