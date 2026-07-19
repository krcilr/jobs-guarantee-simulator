import { useMemo, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import statesTopo from "us-atlas/states-10m.json";
import { FIPS_TO_POSTAL } from "./fips.js";

const WIDTH = 975;
const HEIGHT = 610;

/* 6-step single-hue ramp from the design tokens, resolved via CSS custom
   properties so light mode can invert lightness without touching JS. */
const RAMP = [1, 2, 3, 4, 5, 6].map((n) => `var(--ramp-${n})`);

const geoFeatures = feature(statesTopo, statesTopo.objects.states).features.filter(
  (f) => FIPS_TO_POSTAL[f.id]
);
const path = geoPath(geoAlbersUsa().scale(1300).translate([WIDTH / 2, HEIGHT / 2]));

/**
 * "Where the jobs land" — choropleth of the percentage-point drop in
 * unemployment rate per state (old rate from BLS data, new rate from the sim).
 */
export default function USMap({ sim, blsData, selected, onSelect }) {
  const [hover, setHover] = useState(null); // { code, x, y }

  const { impacts, lo, hi } = useMemo(() => {
    const impacts = {};
    let lo = Infinity;
    let hi = -Infinity;
    for (const [code, s] of Object.entries(sim.states)) {
      const oldRate = (100 * s.unemployed) / blsData.states[code].labor_force;
      const drop = oldRate - s.newUnemploymentRate;
      impacts[code] = { drop, oldRate };
      if (drop < lo) lo = drop;
      if (drop > hi) hi = drop;
    }
    return { impacts, lo, hi };
  }, [sim, blsData]);

  const colorFor = (code) => {
    const { drop } = impacts[code];
    if (hi === lo) return RAMP[RAMP.length - 1];
    const t = (drop - lo) / (hi - lo);
    return RAMP[Math.min(RAMP.length - 1, Math.floor(t * RAMP.length))];
  };

  const hoverState = hover ? sim.states[hover.code] : null;

  return (
    <>
      <div className="map-head">
        <div className="map-title">
          Where the jobs land <span>&mdash; drop in unemployment rate by state</span>
        </div>
        <div className="map-legend micro" aria-hidden="true">
          <span>&minus;{lo.toFixed(1)} pp</span>
          {RAMP.map((c) => (
            <span key={c} className="legend-swatch" style={{ background: c }} />
          ))}
          <span>&minus;{hi.toFixed(1)}</span>
        </div>
      </div>

      <div className="map-wrap">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="US map of drop in unemployment rate by state"
        >
          {geoFeatures.map((f) => {
            const code = FIPS_TO_POSTAL[f.id];
            return (
              <path
                key={code}
                d={path(f)}
                fill={colorFor(code)}
                stroke="var(--bg)"
                strokeWidth={0.75}
                className={`state${selected === code ? " state-selected" : ""}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.ownerSVGElement.parentNode.getBoundingClientRect();
                  setHover({ code, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(selected === code ? null : code)}
              />
            );
          })}
        </svg>

        {hoverState && (
          <div
            className="map-tooltip"
            style={{ left: Math.min(hover.x + 14, 700), top: hover.y + 14 }}
          >
            <strong>{hoverState.name}</strong>
            <span className="tip-data">
              &minus;{impacts[hover.code].drop.toFixed(1)} pp &middot;{" "}
              {hoverState.programWorkers.toLocaleString("en-US")} jobs
            </span>
          </div>
        )}
      </div>
    </>
  );
}
