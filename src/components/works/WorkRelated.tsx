import { ArrowIcon } from "@/components/shell/ArrowIcon";
import { imagesAttr, workHref } from "@/lib/data";
import type { Work } from "@/lib/types";

type WorkRelatedProps = {
  related: Work[];
};

export function WorkRelated({ related }: WorkRelatedProps) {
  return (
    <section className="section" data-tone-start="#0A0718" data-tone-end="#0A0718">
      <header className="section-head">
        <p className="eyebrow">More case studies</p>
        <h2 className="title">Keep reading.</h2>
      </header>
      <ul className="rest-list">
        {related.map((item) => (
          <li key={item.slug}>
            <a
              className="rest-row"
              href={workHref(item.slug)}
              data-images={imagesAttr(item.images)}
            >
              <span
                className="rest-shot"
                style={{ backgroundImage: `url(${item.images[0]})` }}
              />
              <span className="rest-name">{item.short}</span>
              <span className="rest-role">{item.role}</span>
              <span className="rest-year">{item.year}</span>
              <ArrowIcon />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
