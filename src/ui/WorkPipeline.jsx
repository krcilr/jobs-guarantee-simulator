/** Future work categories, deliberately static: the signal is "we never run out of useful work." */
const PIPELINE = [
  "Elder care",
  "Disaster resilience",
  "Environmental remediation",
  "Rural broadband",
  "Housing retrofits",
  "Tutoring & after-school",
];

const compact = (n) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}K`;

/** "The work side" card: quantified need vs this scenario's workforce, then the pipeline. */
export default function WorkPipeline({ recon }) {
  return (
    <aside className="work-panel card">
      <h3>The work side</h3>
      <p className="work-sub">
        Is there enough useful work? Quantified need vs. this scenario's workforce.
      </p>
      <div className="work-row">
        <span className="label">
          Infrastructure backlog{" "}
          <a
            className="cite"
            href="https://infrastructurereportcard.org/economics/"
            target="_blank"
            rel="noreferrer"
          >
            [ASCE 2025]
          </a>
        </span>
        <span className="value">{compact(recon.infraJobsPerYear)} jobs/yr</span>
      </div>
      <div className="work-row">
        <span className="label">
          Childcare workforce gap{" "}
          <a className="cite" href="https://childcaregap.org" target="_blank" rel="noreferrer">
            [BPC 2025]
          </a>
        </span>
        <span className="value">{compact(recon.childcareWorkers)} workers</span>
      </div>
      <div className="work-row total">
        <span className="label">Program workforce, this scenario</span>
        <span className="value">{compact(recon.programWorkers)}</span>
      </div>
      <span className="micro">And when that runs out</span>
      <ul className="chip-list">
        {PIPELINE.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <p className="work-closer">We never run out of useful work.</p>
    </aside>
  );
}
