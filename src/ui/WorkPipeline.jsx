import { fmtCount, fmtMillions } from "./format.js";

/** Future work categories, deliberately static: the signal is "we never run out of useful work." */
const PIPELINE = [
  "Public housing construction & retrofits",
  "Grid modernization & weatherization",
  "Reforestation & wildfire fuel reduction",
  "Wetland & brownfield restoration",
  "Elder care & home visiting",
  "After-school & summer programs",
  "Disaster preparedness corps",
];

/** Work-side sidebar: quantified work vs program workforce, plus the pipeline list. */
export default function WorkPipeline({ recon }) {
  return (
    <aside className="work-panel">
      <h3>The work side</h3>
      <p className="work-line">
        Infrastructure backlog: <strong>{fmtMillions(recon.infraJobsPerYear)}</strong> jobs/yr sustained for 10 years
      </p>
      <p className="work-line">
        Closing the childcare gap: <strong>{fmtCount(recon.childcareWorkers)}</strong> workers
      </p>
      <p className="work-line">
        Program workforce: <strong>{fmtMillions(recon.programWorkers)}</strong>
      </p>
      <h4>And when that's done</h4>
      <ul className="pipeline-list">
        {PIPELINE.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <p className="work-note">
        Pipeline categories are not yet quantified in the model — they signal that useful public
        work outlasts any plausible program workforce.
      </p>
    </aside>
  );
}
