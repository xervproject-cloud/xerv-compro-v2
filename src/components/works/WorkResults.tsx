import type { Work } from "@/lib/types";

type WorkResultsProps = {
  work: Work;
};

// A long non-numeric value ("Launched on time") reads as a phrase, not a figure.
function isPhrase(value: string) {
  return value.length > 8 && !/\d/.test(value);
}

export function WorkResults({ work }: WorkResultsProps) {
  return (
    <section
      className="section cs-section cs-section-results"
      id="results"
      data-tone-start="#E8E4F2"
      data-tone-end="#E8E4F2"
      data-tone-via="#D4CCEA@0.10,#B8AED8@0.22,#9B8ECC@0.36,#7A6CB8@0.50,#5B4CA6@0.64,#3A3274@0.78,#2A1F6E@0.90"
    >
      <header className="section-head">
        <p className="eyebrow">Results</p>
        <h2 className="title">What we can stand behind.</h2>
      </header>
      <ul className="cs-stats">
        {work.results.map((result) => (
          <li className="cs-stat" key={result.label}>
            <p className="cs-stat-label">{result.label}</p>
            <p
              className={
                isPhrase(result.stat) ? "cs-stat-value is-phrase" : "cs-stat-value"
              }
            >
              {result.stat}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
