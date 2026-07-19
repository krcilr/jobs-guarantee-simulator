import { useMemo, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import statesTopo from "us-atlas/states-10m.json";
import { FIPS_TO_POSTAL } from "./fips.js";
import { fmtCount, fmtRate } from "./format.js";

const WIDTH = 975;
const HEIGHT = 610;

/* Sequential blue ramp (dark-surface steps from the validated reference palette).
   Low impact recedes toward the surface; high impact is brightest. */
const RAMP = ["#104281", "#184f95", "#256abf", "#3987e5", "#6da7ec", "#b7d3f6"];

const geoFeatures = feature(statesTopo, statesTopo.objects.states).features.filter(
  (f) => FIPS_TO_POSTAL[f.id]
);
const path = geoPath(geoAlbersUsa().scale(1300).translate([WIDTH / 2, HEIGHT / 2]));

/**
 * Choropleth of program impact per state, measured as the percentage-point
 * drop in unemployment rate (old rate from BLS data, new rate from the sim).
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
    <div className="map-wrap">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="US map of program impact by state"
      >
        {geoFeatures.map((f) => {
          const code = FIPS_TO_POSTAL[f.id];
          return (
            <path
              key={code}
              d={path(f)}
              fill={colorFor(code)}
              stroke="#0d0d0d"
              strokeWidth={selected === code ? 2.5 : 0.75}
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
          style={{ left: Math.min(hover.x + 14, 760), top: hover.y + 14 }}
        >
          <strong>{hoverState.name}</strong>
          <div>{fmtCount(hoverState.programWorkers)} program workers</div>
          <div>
            {fmtRate(impacts[hover.code].oldRate)} &rarr; {fmtRate(hoverState.newUnemploymentRate)} unemployment
          </div>
        </div>
      )}

      <div className="map-legend" aria-hidden="true">
        <span className="legend-label">Smaller drop</span>
        {RAMP.map((c) => (
          <span key={c} className="legend-swatch" style={{ background: c }} />
        ))}
        <span className="legend-label">Larger drop in unemployment</span>
      </div>
    </div>
  );
}
