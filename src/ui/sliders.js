import { fmtPct } from "./format.js";

/**
 * The 5 visible sliders (v1 scope caps at ~6). Each maps a resolveParams
 * override key to its assumptions.json entry, so ranges/defaults/citations
 * can never drift from config.
 */
export function sliderDefs(assumptions) {
  return [
    {
      key: "wage",
      q: "w",
      label: "Hourly wage",
      range: assumptions.wage.slider_range,
      step: 0.25,
      defaultValue: assumptions.wage.default_hourly,
      fmt: (v) => `$${v.toFixed(2)}/hr`,
      citation: assumptions.wage.citation,
    },
    {
      key: "benefitsLoad",
      q: "b",
      label: "Benefits load",
      range: assumptions.benefits_load.slider_range,
      step: 0.01,
      defaultValue: assumptions.benefits_load.default,
      fmt: (v) => fmtPct(v, 0),
      citation: assumptions.benefits_load.citation,
    },
    {
      key: "participationRate",
      q: "p",
      label: "Participation rate",
      range: assumptions.participation_rate.slider_range,
      step: 0.01,
      defaultValue: assumptions.participation_rate.default,
      fmt: (v) => fmtPct(v, 0),
      citation: assumptions.participation_rate.citation,
    },
    {
      key: "efficiencyMultiplier",
      q: "e",
      label: "Gov't efficiency vs private cost",
      range: assumptions.efficiency_multiplier.slider_range,
      step: 0.01,
      defaultValue: assumptions.efficiency_multiplier.default,
      fmt: (v) => fmtPct(v, 0),
      citation: assumptions.efficiency_multiplier.citation,
    },
    {
      key: "fiscalOffsetRate",
      q: "o",
      label: "Fiscal offsets",
      range: assumptions.fiscal_offset_rate.slider_range,
      step: 0.01,
      defaultValue: assumptions.fiscal_offset_rate.default,
      fmt: (v) => fmtPct(v, 0),
      citation: assumptions.fiscal_offset_rate.citation,
    },
  ];
}

const clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));

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
