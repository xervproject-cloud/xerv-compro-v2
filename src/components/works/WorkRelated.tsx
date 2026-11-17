import { serviceLabel, workHref } from "@/lib/data";
import type { Work } from "@/lib/types";

type WorkRelatedProps = {
  related: Work[];
};

export function WorkRelated({ related }: WorkRelatedProps) {
  return (
    <section
      className="section cs-section cs-more-section"
      data-tone-start="#0A0718"
      data-tone-end="#0A0718"
    >
      <header className="section-head">
        <p className="eyebrow">More case studies</p>
        <h2 className="title">Next in the index.</h2>
      </header>
      <div className="cs-more">
        {related.map((item) => (
          <a key={item.slug} className="cs-more-card" href={workHref(item.slug)}>
            <span
              className="cs-more-shot"
              style={{ backgroundImage: `url(${item.images[0]})` }}
            />
            <span className="cs-more-meta">
              {serviceLabel(item)} — {item.year}
            </span>
            <strong>{item.name}</strong>
            <span className="cs-more-dek">{item.home}</span>
            <span className="cs-more-go">See the case study</span>
          </a>
        ))}
      </div>
    </section>
  );
}
