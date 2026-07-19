/**
 * Test harness: run the engine on real data, print results,
 * and validate against published study benchmarks.
 */
import { readFileSync } from "fs";
import {
  resolveParams, simulateNation, simulateState,
  childcareWorkersNeeded, infrastructureWorkerYears, reconcile,
} from "../src/engine.js";

const load = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url)));
const assumptions = load("../config/assumptions.json");
const bls = load("../data/processed/bls_state_unemployment.json");
const asce = load("../data/processed/asce_infrastructure_gaps.json");
const childcare = load("../data/processed/childcare_gap.json");

const $B = (x) => `$${(x / 1e9).toFixed(1)}B`;
const M = (x) => `${(x / 1e6).toFixed(2)}M`;

// ---- Run with defaults ----
const p = resolveParams(assumptions);
const nation = simulateNation(bls, p);
const t = nation.totals;

console.log("=== NATIONAL SIMULATION (default sliders) ===");
console.log(`Wage $${p.wage}/hr | participation ${p.participationRate * 100}% | benefits ${p.benefitsLoad * 100}% | efficiency ${p.efficiencyMultiplier}x | offsets ${p.fiscalOffsetRate * 100}%`);
console.log(`Unemployed (50 states + DC):   ${M(t.unemployed)}`);
console.log(`Program workers:               ${M(t.programWorkers)}`);
console.log(`All-in comp per worker:        $${Math.round(nation.states.CA.compPerWorker).toLocaleString()}`);
console.log(`Wage bill:                     ${$B(t.wageBill)}`);
console.log(`Non-labor costs:               ${$B(t.nonLabor)}`);
console.log(`Admin:                         ${$B(t.admin)}`);
console.log(`GROSS COST:                    ${$B(t.gross)}`);
console.log(`Fiscal offsets:                -${$B(t.offsets)}`);
console.log(`NET COST:                      ${$B(t.net)}`);
console.log(`New national unemployment:     ${t.newNationalUnemploymentRate.toFixed(2)}% (was ~4.3%)`);

// ---- Work side ----
console.log("\n=== WORK SIDE ===");
const ccWorkers = childcareWorkersNeeded(childcare, p);
console.log(`Childcare workers needed to close 4.2M-slot gap: ${ccWorkers.toLocaleString()}`);
const infra = infrastructureWorkerYears(asce, p);
console.log(`ASCE gap ${$B(infra.gapDollars)} x labor share ${infra.laborShareUsed} = ${$B(infra.laborDollars)} labor dollars`);
console.log(`= ${M(infra.workerYearsTotal)} worker-years over 10 yrs (${M(infra.workerYearsPerYear)} jobs/yr sustained)`);

const rec = reconcile(nation, infra, ccWorkers);
console.log(`\nReconciliation: work available/yr (infra + childcare only): ${M(rec.totalWorkNeeded)}`);
console.log(`Program workforce: ${M(rec.programWorkers)} -> ${rec.workSurplus >= 0 ? "MORE WORK THAN WORKERS" : "more workers than work"} (${M(Math.abs(rec.workSurplus))} difference)`);

// ---- Spot-check states ----
console.log("\n=== SAMPLE STATES ===");
for (const code of ["CA", "SD", "WV", "TX"]) {
  const s = nation.states[code];
  console.log(`${code}: ${s.programWorkers.toLocaleString()} workers, gross ${$B(s.gross)}, net ${$B(s.net)}, unemployment ${bls.states[code].rate}% -> ${s.newUnemploymentRate.toFixed(1)}%`);
}

// ---- Validation vs published studies ----
console.log("\n=== VALIDATION vs PUBLISHED BENCHMARKS ===");
const perWorkerGross = t.gross / t.programWorkers;
console.log(`Our gross cost per worker-year: $${Math.round(perWorkerGross).toLocaleString()}`);
console.log(`CBPP 2018 benchmark: $543B / ~10.7M workers = ~$51k per worker-year (2018 dollars)`);
console.log(`Levy 2018: 11-16M workers at 1.3-2.4% GDP gross (~$45-55k/worker in 2018 dollars)`);
const check1 = perWorkerGross > 45000 && perWorkerGross < 75000;
console.log(`Sanity band $45k-$75k (allowing 2018->2026 inflation): ${check1 ? "PASS" : "FAIL"}`);

// Levy net-cost-vs-GDP check: net should be well under 2% of ~$29T GDP at our smaller scale
const gdp = 29e12;
const netPctGDP = (100 * t.net) / gdp;
console.log(`Net cost as % of GDP: ${netPctGDP.toFixed(2)}% (Levy full program: 0.8-2.0%; ours is smaller scale so should be below)`);
console.log(`Below 2% check: ${netPctGDP < 2 ? "PASS" : "FAIL"}`);

// Internal consistency: gross - offsets = net
const check3 = Math.abs(t.gross - t.offsets - t.net) < 1;
console.log(`Internal consistency (gross - offsets = net): ${check3 ? "PASS" : "FAIL"}`);

// ---- Hostile slider test: the "government is inefficient" scenario ----
console.log("\n=== HOSTILE SLIDER TEST (efficiency 130%, offsets low 15%) ===");
const hostile = resolveParams(assumptions, { efficiencyMultiplier: 1.3, fiscalOffsetRate: 0.15 });
const hn = simulateNation(bls, hostile);
console.log(`Gross: ${$B(hn.totals.gross)} | Net: ${$B(hn.totals.net)} | Workers: ${M(hn.totals.programWorkers)}`);
console.log(`Program still employs millions at higher assumed cost: ${hn.totals.programWorkers > 4e6 ? "PASS" : "FAIL"}`);
