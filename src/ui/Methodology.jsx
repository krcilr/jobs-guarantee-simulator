import assumptions from "../../config/assumptions.json";
import bls from "../../data/processed/bls_state_unemployment.json";
import asce from "../../data/processed/asce_infrastructure_gaps.json";
import childcare from "../../data/processed/childcare_gap.json";
import laborShares from "../../data/processed/labor_share_coefficients.json";

const DATASETS = [bls, asce, childcare, laborShares];

const PARAM_LABELS = {
  wage: "Hourly wage",
  benefits_load: "Benefits load",
  participation_rate: "Participation rate",
  non_labor_cost_markup: "Non-labor cost markup",
  efficiency_multiplier: "Efficiency multiplier",
  admin_overhead: "Administrative overhead",
  fiscal_offset_rate: "Fiscal offset rate",
  labor_share_crosscheck: "Labor shares (cross-check only)",
  childcare_staffing_ratio: "Childcare staffing ratio",
  state_allocation_proxy: "State allocation proxy",
};

function paramDefault(entry) {
  if (entry.default_hourly != null) return `$${entry.default_hourly.toFixed(2)}/hr`;
  if (entry.default != null) return String(entry.default);
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
      <p>
        This page is generated directly from the model's configuration and dataset files —
        the same files the simulation reads. Every parameter and dataset below is exactly
        what the numbers you see are computed from.
      </p>

      <h3>Model parameters</h3>
      {params.map(([key, entry]) => (
        <section key={key} className="method-entry">
          <h4>{PARAM_LABELS[key] ?? key}</h4>
          <div className="method-facts">
            {paramDefault(entry) && <span>Default: <strong>{paramDefault(entry)}</strong></span>}
            {entry.slider_range && (
              <span>Slider range: {entry.slider_range[0]} &ndash; {entry.slider_range[1]}</span>
            )}
          </div>
          {entry.citation && <p className="method-citation">{entry.citation}</p>}
          {entry.citation_url && (
            <a href={entry.citation_url} target="_blank" rel="noreferrer">
              {entry.citation_url}
            </a>
          )}
        </section>
      ))}

      <h3>Datasets</h3>
      {DATASETS.map((d) => (
        <section key={d.meta.dataset} className="method-entry">
          <h4>{d.meta.dataset}</h4>
          <div className="method-facts">
            <span>Source: <strong>{d.meta.source}</strong></span>
            {d.meta.vintage && <span>Vintage: {d.meta.vintage}</span>}
            {d.meta.retrieved && <span>Retrieved: {d.meta.retrieved}</span>}
          </div>
          {d.meta.source_url && (
            <a href={d.meta.source_url} target="_blank" rel="noreferrer">
              {d.meta.source_url}
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

      <h3>Substitution effects</h3>
      <p className="method-citation">
        v1 does not model substitution (workers leaving private jobs for the program) or the
        resulting private-sector wage pressure. Modeling it would raise program size and cost
        while adding a private-wage benefit line; a substitution slider is on the roadmap.
      </p>
    </div>
  );
}
