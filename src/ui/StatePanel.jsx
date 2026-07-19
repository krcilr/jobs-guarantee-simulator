import { fmtBillions, fmtCount, fmtRate } from "./format.js";

/** Detail panel for the clicked state. */
export default function StatePanel({ state, blsState, onClose }) {
  const oldRate = (100 * state.unemployed) / blsState.labor_force;
  return (
    <div className="state-panel">
      <div className="state-panel-head">
        <h3>{state.name}</h3>
        <button className="close-btn" onClick={onClose} aria-label="Close state detail">
          &times;
        </button>
      </div>
      <dl>
        <dt>Unemployed (Apr 2026)</dt>
        <dd>{fmtCount(state.unemployed)}</dd>
        <dt>Program workers</dt>
        <dd>{fmtCount(state.programWorkers)}</dd>
        <dt>Unemployment rate</dt>
        <dd>
          {fmtRate(oldRate)} &rarr; <strong>{fmtRate(state.newUnemploymentRate)}</strong>
        </dd>
        <dt>Gross cost</dt>
        <dd>{fmtBillions(state.gross)}</dd>
        <dt>Net cost</dt>
        <dd>{fmtBillions(state.net)}</dd>
      </dl>
    </div>
  );
}
