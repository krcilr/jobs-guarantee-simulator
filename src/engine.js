/**
 * Jobs Guarantee Simulator — Engine
 *
 * Pure functions only: (data, assumptions, sliderOverrides) -> results.
 * No I/O, no DOM, no state. This exact file runs in Node for testing
 * and in the browser for the app.
 *
 * Primary method (Levy): model workers first, cost = wages + benefits
 *   + non-labor markup + admin, minus fiscal offsets.
 * Cross-check method (BEA): convert ASCE backlog dollars -> labor dollars
 *   -> worker-years via labor-share coefficients.
 */

// ---------- helpers ----------

/** Merge slider overrides onto config defaults. Overrides use param names, e.g. { wage: 15, participation_rate: 0.8 } */
export function resolveParams(assumptions, overrides = {}) {
  const p = {
    wage: assumptions.wage.default_hourly,
    annualHours: assumptions.wage.annual_hours,
    benefitsLoad: assumptions.benefits_load.default,
    participationRate: assumptions.participation_rate.default,
    nonLaborMarkup: assumptions.non_labor_cost_markup.default,
    efficiencyMultiplier: assumptions.efficiency_multiplier.default,
    adminOverhead: assumptions.admin_overhead.default,
    fiscalOffsetRate: assumptions.fiscal_offset_rate.default,
    childcareRatio: assumptions.childcare_staffing_ratio.children_per_worker,
    laborShares: { ...assumptions.labor_share_crosscheck },
  };
  return { ...p, ...overrides };
}

/** Annual all-in compensation per worker (wages + benefits). */
export function compensationPerWorker(p) {
  const annualWage = p.wage * p.annualHours;
  return annualWage * (1 + p.benefitsLoad);
}

// ---------- primary engine (Levy method) ----------

/**
 * Cost model for a given number of program workers.
 * Returns all intermediate lines so the UI can show its work.
 */
export function costForWorkers(workers, p) {
  const compPerWorker = compensationPerWorker(p);
  const wageBill = workers * compPerWorker;
  const nonLabor = wageBill * p.nonLaborMarkup * p.efficiencyMultiplier;
  const admin = (wageBill + nonLabor) * p.adminOverhead;
  const gross = wageBill + nonLabor + admin;
  const offsets = gross * p.fiscalOffsetRate;
  const net = gross - offsets;
  return { workers, compPerWorker, wageBill, nonLabor, admin, gross, offsets, net };
}

/**
 * Run the simulation for one state.
 * stateData: { name, labor_force, unemployed }
 */
export function simulateState(stateData, p) {
  const programWorkers = Math.round(stateData.unemployed * p.participationRate);
  const cost = costForWorkers(programWorkers, p);
  const newUnemploymentRate =
    (100 * (stateData.unemployed - programWorkers)) / stateData.labor_force;
  return {
    name: stateData.name,
    unemployed: stateData.unemployed,
    programWorkers,
    newUnemploymentRate,
    ...cost,
  };
}

/** Run all states + national rollup. blsData = parsed bls_state_unemployment.json */
export function simulateNation(blsData, p, { excludePR = true } = {}) {
  const states = {};
  let totals = { unemployed: 0, programWorkers: 0, wageBill: 0, nonLabor: 0, admin: 0, gross: 0, offsets: 0, net: 0, laborForce: 0 };
  for (const [code, s] of Object.entries(blsData.states)) {
    if (excludePR && code === "PR") continue;
    const r = simulateState(s, p);
    states[code] = r;
    totals.unemployed += r.unemployed;
    totals.programWorkers += r.programWorkers;
    totals.wageBill += r.wageBill;
    totals.nonLabor += r.nonLabor;
    totals.admin += r.admin;
    totals.gross += r.gross;
    totals.offsets += r.offsets;
    totals.net += r.net;
    totals.laborForce += s.labor_force;
  }
  totals.newNationalUnemploymentRate =
    (100 * (totals.unemployed - totals.programWorkers)) / totals.laborForce;
  return { states, totals };
}

// ---------- work-side: what can these workers accomplish? ----------

/**
 * Childcare: convert the slot gap into workers needed.
 */
export function childcareWorkersNeeded(childcareData, p) {
  return Math.round(childcareData.national.gap_children_without_access / p.childcareRatio);
}

/**
 * Cross-check (BEA method): worker-years of employment embedded in the
 * ASCE infrastructure funding gap, using labor-share coefficients.
 * asceData = parsed asce_infrastructure_gaps.json (values in $B)
 * Returns worker-years over the 10-yr gap window and per-year average.
 */
export function infrastructureWorkerYears(asceData, p, laborShare = null) {
  const share = laborShare ?? p.laborShares.construction;
  const gapDollars = asceData.national_totals.gap * 1e9;
  const laborDollars = gapDollars * share;
  const workerYears = laborDollars / compensationPerWorker(p);
  return {
    gapDollars,
    laborShareUsed: share,
    laborDollars,
    workerYearsTotal: workerYears,
    workerYearsPerYear: workerYears / 10, // ASCE window is 2024-2033
  };
}

/**
 * Reconciliation: does the workforce (Levy method) match the work (BEA method)?
 * The credibility question the methodology page answers.
 */
export function reconcile(nationSim, infraWY, childcareWorkers) {
  const infraJobsPerYear = Math.round(infraWY.workerYearsPerYear);
  const totalWorkNeeded = infraJobsPerYear + childcareWorkers; // + environmental (future)
  return {
    programWorkers: nationSim.totals.programWorkers,
    infraJobsPerYear,
    childcareWorkers,
    totalWorkNeeded,
    workSurplus: totalWorkNeeded - nationSim.totals.programWorkers,
  };
}
