import { fmtPct } from "./format.js";

/**
 * The 5 visible sliders (v1 scope caps at ~6). Each maps a resolveParams
 * override key to its assumptions.json entry, so ranges/defaults/citations
 * can never drift from config.
 *
 * `hostileDir` marks which direction from the cited default raises program
 * cost — moving that way flips the slider (and the app) into skeptic mode,
 * per the design rule: amber appears exclusively for hostile state.
 */
export function sliderDefs(assumptions) {
  return [
    {
      key: "participationRate",
      q: "p",
      label: "Take-up rate",
      tag: "Levy",
      range: assumptions.participation_rate.slider_range,
      step: 0.01,
      defaultValue: assumptions.participation_rate.default,
      hostileDir: +1,
      fmt: (v) => fmtPct(v, 0),
      citation: assumptions.participation_rate.citation,
    },
    {
      key: "wage",
      q: "w",
      label: "Program wage",
      tag: "Levy",
      range: assumptions.wage.slider_range,
      step: 0.25,
      defaultValue: assumptions.wage.default_hourly,
      hostileDir: +1,
      fmt: (v) => `$${v.toFixed(2)}/hr`,
      citation: assumptions.wage.citation,
    },
    {
      key: "benefitsLoad",
      q: "b",
      label: "Benefits load",
      tag: "Levy",
      range: assumptions.benefits_load.slider_range,
      step: 0.01,
      defaultValue: assumptions.benefits_load.default,
      hostileDir: +1,
      fmt: (v) => fmtPct(v, 0),
      citation: assumptions.benefits_load.citation,
    },
    {
      key: "efficiencyMultiplier",
      q: "e",
      label: "Gov. efficiency vs private cost",
      tag: "CBO lit",
      range: assumptions.efficiency_multiplier.slider_range,
      step: 0.01,
      defaultValue: assumptions.efficiency_multiplier.default,
      hostileDir: +1,
      fmt: (v) => fmtPct(v, 0),
      citation: assumptions.efficiency_multiplier.citation,
    },
    {
      key: "fiscalOffsetRate",
      q: "o",
      label: "Fiscal offsets",
      tag: "Levy",
      range: assumptions.fiscal_offset_rate.slider_range,
      step: 0.01,
      defaultValue: assumptions.fiscal_offset_rate.default,
      hostileDir: -1,
      fmt: (v) => fmtPct(v, 0),
      citation: assumptions.fiscal_offset_rate.citation,
    },
  ];
}

/** True when this slider sits on the cost-raising side of its cited default. */
export function isHostile(def, value) {
  return def.hostileDir * (value - def.defaultValue) > 1e-9;
}

const clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));

/** Fraction of the track where a value sits — used to place default ticks. */
export const trackFraction = (def, value) =>
  (value - def.range[0]) / (def.range[1] - def.range[0]);

/** Read slider values from the URL query string; anything absent or invalid falls back to the config default. */
export function valuesFromUrl(defs, search = window.location.search) {
  const params = new URLSearchParams(search);
  const values = {};
  for (const d of defs) {
    const raw = parseFloat(params.get(d.q));
    values[d.key] = Number.isFinite(raw) ? clamp(raw, d.range) : d.defaultValue;
  }
  return values;
}

/** Serialize slider values into the URL (only non-default values, so default links stay clean). */
export function urlFromValues(defs, values) {
  const params = new URLSearchParams();
  for (const d of defs) {
    if (values[d.key] !== d.defaultValue) params.set(d.q, String(values[d.key]));
  }
  const qs = params.toString();
  return `${window.location.pathname}${qs ? "?" + qs : ""}${window.location.hash}`;
}
