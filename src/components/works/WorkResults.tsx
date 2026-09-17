import type { Work } from "@/lib/types";

type WorkResultsProps = {
  work: Work;
};

export function WorkResults({ work }: WorkResultsProps) {
  return (
    <section
      className="section"
      id="results"
      data-tone-start="#EFEDE9"
      data-tone-end="#EFEDE9"
    >
      <header className="section-head">
        <p className="eyebrow">Results</p>
        <h2 className="title">What moved after launch.</h2>
      </header>
      <ul className="cs-results">
        {work.results.map((result) => (
          <li key={result.label}>
            <span className="cs-stat">{result.stat}</span>
            <span className="cs-stat-label">{result.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
