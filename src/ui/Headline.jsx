import { fmtRate } from "./format.js";

/** Hero stat band: mono micro labels, 62px tabular values, cited subtitles. */
export default function Headline({ sim, gdpShare, skeptic }) {
  const t = sim.totals;
  const oldRate = (100 * t.unemployed) / t.laborForce;
  const netB = (t.net / 1e9).toFixed(1);
  const gdpUnderOne = (100 * t.net) / 29.0e12 < 1;

  return (
    <div className="headline-row">
      <div className="stat-tile">
        <div className="stat-label micro">People employed</div>
        <div className="stat-value">{t.programWorkers.toLocaleString("en-US")}</div>
        <div className="stat-sub">
          take-up of the officially unemployed{" "}
          <a
            className="cite"
            href="https://www.levyinstitute.org/pubs/wp_902.pdf"
            target="_blank"
            rel="noreferrer"
          >
            [Levy 2018]
          </a>
        </div>
      </div>
      <div className="stat-tile">
        <div className="stat-label micro">Unemployment rate</div>
        <div className="stat-value rate">
          <span className="rate-old">{fmtRate(oldRate)}</span>
          <span className="rate-arrow">&#10142;</span>
          <span className="rate-new">{fmtRate(t.newNationalUnemploymentRate)}</span>
        </div>
        <div className="stat-sub">
          U-3, seasonally adjusted{" "}
          <a
            className="cite"
            href="https://www.bls.gov/news.release/laus.t01.htm"
            target="_blank"
            rel="noreferrer"
          >
            [BLS Apr 2026]
          </a>
        </div>
      </div>
      <div className="stat-tile">
        <div className="stat-label micro">Net cost per year</div>
        <div className="stat-value">
          ${netB}
          <span className="unit">B</span>
        </div>
        <div className="stat-sub">
          <strong>{gdpShare} of GDP</strong> &middot; after fiscal offsets
          {skeptic && gdpUnderOne && <> &mdash; still under 1% at hostile settings</>}
        </div>
      </div>
    </div>
  );
}
