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
import { sliderDefs, valuesFromUrl, urlFromValues, isHostile, trackFraction } from "./sliders.js";
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
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("keydown", onKey);
    };
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

  // Skeptic mode: any slider pushed to the cost-raising side of its cited default.
  const skeptic = DEFS.some((d) => isHostile(d, values[d.key]));
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
        <div className="brand">
          <h1>Jobs Guarantee Simulator</h1>
          <span className="micro">Every number cited</span>
        </div>
        <nav>
          <a href="#/" className={!isMethodology ? "active" : ""}>Simulator</a>
          <a href="#/methodology" className={isMethodology ? "active" : ""}>Methodology</a>
          <a href="https://github.com/krcilr/jobs-guarantee-simulator" target="_blank" rel="noreferrer">
            GitHub &#8599;
          </a>
        </nav>
      </header>

      {isMethodology ? (
        <Methodology />
      ) : (
        <>
          <div className="kicker micro">
            If the US guaranteed a job to anyone who wants one &mdash; at these assumptions &mdash;
          </div>
          <Headline sim={sim.nation} gdpShare={gdpShare} skeptic={skeptic} />

          <div className="main-grid">
            <section className="controls card">
              <div className="controls-head">
                <h3>Assumptions</h3>
                {skeptic ? (
                  <span className="skeptic-badge">Skeptic settings active</span>
                ) : (
                  <span className="micro">{DEFS.length} parameters</span>
                )}
              </div>
              <p className="provocation">
                Think we're cooking the books? Drag{" "}
                <button
                  onClick={() => setValues((v) => ({ ...v, efficiencyMultiplier: 1.3 }))}
                >
                  government efficiency to 130%
                </button>{" "}
                of private cost and watch the bottom line.
              </p>
              {DEFS.map((d) => {
                const hostile = isHostile(d, values[d.key]);
                return (
                  <label
                    key={d.key}
                    className={`slider-row${hostile ? " hostile" : ""}`}
                    title={d.citation}
                  >
                    <span className="slider-head">
                      <span className="slider-name">
                        {d.label}
                        <span className="cite">[{d.tag}]</span>
                      </span>
                      <span className="value-chip">{d.fmt(values[d.key])}</span>
                    </span>
                    <span className="track-wrap">
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
                      <span
                        className="default-tick"
                        style={{ left: `${100 * trackFraction(d, d.defaultValue)}%` }}
                      />
                    </span>
                    <span className="slider-scale">
                      <span>{d.fmt(d.range[0])}</span>
                      <span>cited default</span>
                      <span>{d.fmt(d.range[1])}</span>
                    </span>
                  </label>
                );
              })}
              <div className="btn-row">
                <button className="btn-primary" onClick={copyLink}>
                  {copied ? "Copied!" : "Copy share link"}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    setValues(Object.fromEntries(DEFS.map((d) => [d.key, d.defaultValue])))
                  }
                >
                  Reset to cited defaults
                </button>
              </div>
            </section>

            <section className="map-card card">
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
                />
              )}
            </section>

            <WorkPipeline recon={sim.recon} />
          </div>
        </>
      )}

      <footer className="app-footer micro">
        <span>
          MIT license &middot; every number cited &middot;{" "}
          <a href="https://github.com/krcilr/jobs-guarantee-simulator" target="_blank" rel="noreferrer">
            source on GitHub
          </a>
        </span>
        <span>Data vintage &mdash; BLS: Apr 2026 &middot; ASCE: 2025 &middot; Levy: 2018</span>
      </footer>
    </div>
  );
}
