import { fmtBillions, fmtMillions, fmtRate } from "./format.js";

/** The headline counter: workers, new unemployment rate, net cost. */
export default function Headline({ sim, gdpShare }) {
  const t = sim.totals;
  return (
    <div className="headline-row">
      <div className="stat-tile">
        <div className="stat-value">{fmtMillions(t.programWorkers)}</div>
        <div className="stat-label">people employed</div>
      </div>
      <div className="stat-tile">
        <div className="stat-value">
          {fmtRate((100 * t.unemployed) / t.laborForce)} &rarr; {fmtRate(t.newNationalUnemploymentRate)}
        </div>
        <div className="stat-label">national unemployment</div>
      </div>
      <div className="stat-tile">
        <div className="stat-value">{fmtBillions(t.net)}/yr</div>
        <div className="stat-label">net cost ({gdpShare} of GDP)</div>
      </div>
    </div>
  );
}
