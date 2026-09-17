import type { Work } from "@/lib/types";

type WorkOverviewProps = {
  work: Work;
};

export function WorkOverview({ work }: WorkOverviewProps) {
  const chips = [work.role, work.year, work.location || work.industry].filter(Boolean);

  return (
    <section
      className="section cs-hero"
      id="overview"
      data-tone-start="#0A0718"
      data-tone-end="#241A5E"
    >
      <p className="eyebrow">Case study</p>
      <h1 className="display display-sm">
        <span className="mask">
          <span className="mask-in">{work.headline}</span>
        </span>
      </h1>
      <p className="lead cs-dek">{work.dek}</p>
      <ul className="cs-chips">
        {chips.map((chip) => (
          <li key={chip}>{chip}</li>
        ))}
      </ul>
      <figure className="cs-hero-fig">
        <img className="cs-hero-img" src={work.images[0]} alt="" data-bridge-target />
      </figure>
    </section>
  );
}
