import { fmtBillions, fmtCount, fmtRate } from "./format.js";

/** Horizontal detail strip under the map for the clicked state (Esc closes). */
export default function StatePanel({ state, blsState }) {
  const oldRate = (100 * state.unemployed) / blsState.labor_force;
  return (
    <div className="state-strip">
      <div className="state-strip-id">
        <h3>{state.name}</h3>
        <span className="micro">Clicked state &middot; esc to close</span>
      </div>
      <div className="state-stat">
        <span className="micro">Unemployed</span>
        <span className="state-stat-value">{fmtCount(state.unemployed)}</span>
      </div>
      <div className="state-stat">
        <span className="micro">Program workers</span>
        <span className="state-stat-value">{fmtCount(state.programWorkers)}</span>
      </div>
      <div className="state-stat">
        <span className="micro">Rate</span>
        <span className="state-stat-value">
          <span className="rate-old">{fmtRate(oldRate)}</span>{" "}
          <span className="rate-new">{fmtRate(state.newUnemploymentRate)}</span>
        </span>
      </div>
      <div className="state-stat">
        <span className="micro">Gross / net cost</span>
        <span className="state-stat-value">
          {fmtBillions(state.gross)} <span className="net">/ {fmtBillions(state.net)}</span>
        </span>
      </div>
    </div>
  );
}
