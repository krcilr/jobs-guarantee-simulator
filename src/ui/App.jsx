import { useEffect, useMemo, useState } from "react";
import {
  resolveParams,
  simulateNation,
  childcareWorkersNeeded,
  infrastructureWorkerYears,
  reconcile,
} from "../engine.js";
import assumptions from "../../config/assumptions.json";
import blsData from "../../data/processed/bls_state_unemployment.json";
import asceData from "../../data/processed/asce_infrastructure_gaps.json";
import childcareData from "../../data/processed/childcare_gap.json";
import { sliderDefs, valuesFromUrl, urlFromValues } from "./sliders.js";
import Headline from "./Headline.jsx";
import USMap from "./USMap.jsx";
import StatePanel from "./StatePanel.jsx";
import WorkPipeline from "./WorkPipeline.jsx";
import Methodology from "./Methodology.jsx";

// US nominal GDP, ~2026. Display-only context for the net-cost tile (matches test/run.js).
const US_GDP = 29.0e12;

const DEFS = sliderDefs(assumptions);

export default function App() {
  const [values, setValues] = useState(() => valuesFromUrl(DEFS));
  const [selected, setSelected] = useState(null);
  const [route, setRoute] = useState(() => window.location.hash);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Every slider state serializes into the URL: sharing a link shares the scenario.
  useEffect(() => {
    window.history.replaceState(null, "", urlFromValues(DEFS, values));
  }, [values]);

  const sim = useMemo(() => {
    const p = resolveParams(assumptions, values);
    const nation = simulateNation(blsData, p);
    const childcareWorkers = childcareWorkersNeeded(childcareData, p);
    const infraWY = infrastructureWorkerYears(asceData, p);
    return { nation, recon: reconcile(nation, infraWY, childcareWorkers) };
  }, [values]);

  const gdpShare = `${((100 * sim.nation.totals.net) / US_GDP).toFixed(2)}%`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isMethodology = route === "#/methodology";

  return (
    <div className="app">
      <header className="app-header">
        <h1>Jobs Guarantee Simulator</h1>
        <nav>
          <a href="#/" className={!isMethodology ? "active" : ""}>Simulator</a>
          <a href="#/methodology" className={isMethodology ? "active" : ""}>Methodology</a>
          <a href="https://github.com/krcilr/jobs-guarantee-simulator" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </header>

      {isMethodology ? (
        <Methodology />
      ) : (
        <>
          <Headline sim={sim.nation} gdpShare={gdpShare} />

          <div className="main-grid">
            <section className="controls">
              <div className="controls-head">
                <h3>Set the assumptions</h3>
                <button className="share-btn" onClick={copyLink}>
                  {copied ? "Copied!" : "Copy share link"}
                </button>
              </div>
              {DEFS.map((d) => (
                <label key={d.key} className="slider-row" title={d.citation}>
                  <span className="slider-label">
                    {d.label}
                    <strong>{d.fmt(values[d.key])}</strong>
                  </span>
                  <input
                    type="range"
                    min={d.range[0]}
                    max={d.range[1]}
                    step={d.step}
                    value={values[d.key]}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [d.key]: parseFloat(e.target.value) }))
                    }
                  />
                </label>
              ))}
              <button
                className="reset-btn"
                onClick={() =>
                  setValues(Object.fromEntries(DEFS.map((d) => [d.key, d.defaultValue])))
                }
              >
                Reset to cited defaults
              </button>
              <p className="controls-note">
                Think the government is inefficient? Drag efficiency to 130% of private cost
                and see what happens. Every default is cited — see the methodology page.
              </p>
            </section>

            <section className="map-col">
              <USMap
                sim={sim.nation}
                blsData={blsData}
                selected={selected}
                onSelect={setSelected}
              />
              {selected && (
                <StatePanel
                  state={sim.nation.states[selected]}
                  blsState={blsData.states[selected]}
                  onClose={() => setSelected(null)}
                />
              )}
            </section>

            <WorkPipeline recon={sim.recon} />
          </div>
        </>
      )}

      <footer className="app-footer">
        Open source under MIT &middot; every number cited &middot; BLS data: April 2026
      </footer>
    </div>
  );
}
