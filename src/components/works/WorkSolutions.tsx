import type { Work } from "@/lib/types";

type WorkSolutionsProps = {
  work: Work;
};

export function WorkSolutions({ work }: WorkSolutionsProps) {
  return (
    <section
      className="section"
      id="solution"
      data-tone-start="#241A5E"
      data-tone-end="#CBC5DE"
    >
      <header className="section-head">
        <p className="eyebrow">Solutions</p>
        <h2 className="title">How we framed and shipped the work.</h2>
      </header>
      <div className="note-grid">
        {work.solutions.map((item) => (
          <div className="note-block" key={item.title}>
            <p className="note-key">{item.title}</p>
            <p className="note-copy">{item.body}</p>
          </div>
        ))}
      </div>
      {work.images.length > 1 ? (
        <div className="cs-gallery">
          {work.images.slice(1).map((src) => (
            <figure key={src} className="cs-gallery-fig">
              <img src={src} alt="" />
            </figure>
          ))}
        </div>
      ) : null}
    </section>
  );
}
