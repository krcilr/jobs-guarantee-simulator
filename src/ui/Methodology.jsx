import assumptions from "../../config/assumptions.json";
import bls from "../../data/processed/bls_state_unemployment.json";
import asce from "../../data/processed/asce_infrastructure_gaps.json";
import childcare from "../../data/processed/childcare_gap.json";
import laborShares from "../../data/processed/labor_share_coefficients.json";

const DATASETS = [bls, asce, childcare, laborShares];

const PARAM_LABELS = {
  wage: "Program wage",
  benefits_load: "Benefits load",
  participation_rate: "Take-up rate",
  non_labor_cost_markup: "Materials & non-labor markup",
  efficiency_multiplier: "Gov. efficiency vs private cost",
  admin_overhead: "Administrative overhead",
  fiscal_offset_rate: "Fiscal offsets",
  labor_share_crosscheck: "Labor shares (cross-check only)",
  childcare_staffing_ratio: "Childcare staffing ratio",
  state_allocation_proxy: "State allocation proxy",
};

const isFraction = (key) =>
  ["benefits_load", "participation_rate", "non_labor_cost_markup", "efficiency_multiplier", "admin_overhead", "fiscal_offset_rate"].includes(key);

function fmtParamValue(key, v) {
  if (key === "wage") return `$${v.toFixed(2)}/hr`;
  if (isFraction(key)) return `${Math.round(100 * v)}%`;
  return String(v);
}

function paramDefault(key, entry) {
  if (entry.default_hourly != null) return fmtParamValue(key, entry.default_hourly);
  if (entry.default != null) return fmtParamValue(key, entry.default);
  if (entry.children_per_worker != null) return `${entry.children_per_worker} children per worker`;
  if (entry.method != null) return entry.method;
  return null;
}

/**
 * Auto-generated from config/assumptions.json and each dataset's meta block.
 * Nothing on this page is hand-written, so citations can never drift from the math.
 */
export default function Methodology() {
  const params = Object.entries(assumptions).filter(([k]) => !k.startsWith("_"));
  return (
    <div className="methodology">
      <h2>Methodology</h2>
      <p className="method-intro">
        This page is generated from the same config file the simulator runs on &mdash; every
        parameter, its cited default, the range we let you push it to, and where the number
        comes from. If you find a number without a source,{" "}
        <a
          href="https://github.com/krcilr/jobs-guarantee-simulator/issues"
          target="_blank"
          rel="noreferrer"
        >
          file an issue
        </a>
        .
      </p>

      <span className="micro method-section">Model parameters &mdash; {params.length}</span>
      <div className="method-grid">
        {params.map(([key, entry]) => {
          const dflt = entry.default_hourly ?? entry.default;
          const hasRange = Array.isArray(entry.slider_range) && dflt != null;
          const frac = hasRange
            ? (dflt - entry.slider_range[0]) / (entry.slider_range[1] - entry.slider_range[0])
            : 0;
          return (
            <section key={key} className="method-entry card">
              <div className="method-entry-head">
                <h4>{PARAM_LABELS[key] ?? key}</h4>
                {paramDefault(key, entry) && (
                  <span className="value-chip">default {paramDefault(key, entry)}</span>
                )}
              </div>
              {hasRange && (
                <>
                  <div className="range-viz">
                    <span className="default-tick" style={{ left: `${100 * frac}%` }} />
                  </div>
                  <div className="range-labels">
                    <span>range {fmtParamValue(key, entry.slider_range[0])}</span>
                    {key === "efficiency_multiplier" ? (
                      <span className="hostile-note">
                        {fmtParamValue(key, entry.slider_range[1])} (deliberately hostile)
                      </span>
                    ) : (
                      <span>{fmtParamValue(key, entry.slider_range[1])}</span>
                    )}
                  </div>
                </>
              )}
              {entry.citation && <p>{entry.citation}</p>}
              {entry.citation_url && (
                <a
                  className="cite source-link"
                  href={entry.citation_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  source &#10142; {new URL(entry.citation_url).hostname}
                </a>
              )}
            </section>
          );
        })}
      </div>

      <span className="micro method-section">Datasets &mdash; {DATASETS.length}</span>
      <div className="method-grid">
        {DATASETS.map((d) => (
          <section key={d.meta.dataset} className="method-entry card">
            <div className="method-entry-head">
              <h4>{d.meta.dataset}</h4>
            </div>
            <div className="method-facts">
              <span>{d.meta.source}</span>
            </div>
            <div className="range-labels">
              {d.meta.vintage && <span>vintage: {d.meta.vintage}</span>}
              {d.meta.retrieved && <span>retrieved: {d.meta.retrieved}</span>}
            </div>
            {d.meta.source_url && (
              <a
                className="cite source-link"
                href={d.meta.source_url}
                target="_blank"
                rel="noreferrer"
              >
                source &#10142; {new URL(d.meta.source_url).hostname}
              </a>
            )}
            {d.meta.notes && (
              <details>
                <summary>Notes &amp; limitations</summary>
                <ul>
                  {(Array.isArray(d.meta.notes) ? d.meta.notes : [d.meta.notes]).map((n, i) => (
                    <li key={i}>{typeof n === "string" ? n : JSON.stringify(n)}</li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        ))}
      </div>

      <span className="micro method-section">Substitution effects</span>
      <p className="method-intro">
        v1 does not model substitution (workers leaving private jobs for the program) or the
        resulting private-sector wage pressure. Modeling it would raise program size and cost
        while adding a private-wage benefit line; a substitution slider is on the roadmap.
      </p>
    </div>
  );
}
