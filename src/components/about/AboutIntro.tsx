import { getAbout } from "@/lib/data";

export function AboutIntro() {
  const about = getAbout();

  return (
    <section
      className="section section-intro"
      data-tone-start="#0A0718"
      data-tone-end="#241A5E"
      data-tone-via="#2A1F6E@0.55,#3A2F7A@0.88"
    >
      <p className="eyebrow">{about.eyebrow}</p>
      <h1 className="display">
        <span className="mask">
          <span className="mask-in">{about.headline[0]}</span>
        </span>
        <span className="mask">
          <span className="mask-in dim">{about.headline[1]}</span>
        </span>
      </h1>
      <div className="intro-body">
        {about.leads.map((lead) => (
          <p className="lead" key={lead.slice(0, 24)}>
            {lead}
          </p>
        ))}
      </div>
    </section>
  );
}
