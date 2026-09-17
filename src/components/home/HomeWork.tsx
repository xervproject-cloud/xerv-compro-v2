import { ArrowIcon } from "@/components/shell/ArrowIcon";
import {
  getAlsoDelivered,
  getFeaturedHome,
  getWork,
  imagesAttr,
  workHref,
} from "@/lib/data";

export function HomeWork() {
  const featured = getFeaturedHome();
  const alsoDelivered = getAlsoDelivered();
  const frank = getWork("frank");

  const moreImages = [
    "/assets/vimentis-1.jpg",
    "/assets/evoke-1.jpg",
    "/assets/evecharge-1.jpg",
    "/assets/lloe-1.jpg",
    "/assets/faxtor-1.jpg",
  ].join(",");

  return (
    <section className="work" id="work">
      <div className="stage-track" style={{ ["--slides" as string]: featured.length }}>
        <div className="stage">
          <div className="stage-media" aria-hidden="true">
            {featured.map((work) => (
              <div
                key={work.slug}
                className="stage-shot"
                style={{ backgroundImage: `url(${work.images[0]})` }}
              />
            ))}
          </div>
          <span className="stage-scrim" aria-hidden="true" />
          <span className="stage-rule" aria-hidden="true">
            <i />
          </span>
          <div className="stage-copy">
            {featured.map((work, index) => {
              const href = workHref(work.slug);
              const locationLabel =
                work.slug === "mores" ? "with Dassein" : work.location || work.industry;
              return (
                <article
                  key={work.slug}
                  className="slide"
                  data-href={href}
                  data-images={imagesAttr(work.images)}
                >
                  <p className="slide-meta">
                    <span>{String(index + 1).padStart(2, "0")}</span> — {work.role} — {work.year}
                    {locationLabel ? ` — ${locationLabel}` : ""}
                  </p>
                  <h3 className="slide-name">{work.short}</h3>
                  <p className="slide-copy">{work.home}</p>
                  <a className="slide-go" href={href}>
                    View case study
                    <ArrowIcon />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="work-rest"
        data-tone-box
        data-tone-start="#0A0718"
        data-tone-end="#0A0718"
      >
        <p className="eyebrow">Also delivered</p>
        <ul className="rest-list">
          {alsoDelivered.map((work) => (
            <li key={work.slug}>
              <a
                className="rest-row"
                href={workHref(work.slug)}
                data-images={imagesAttr(work.images)}
              >
                <span
                  className="rest-shot"
                  style={{ backgroundImage: `url(${work.images[0]})` }}
                />
                <span className="rest-name">{work.short}</span>
                <span className="rest-role">{work.scope.includes("Mobile") ? "Mobile" : work.role}</span>
                <span className="rest-year">{work.year}</span>
              </a>
            </li>
          ))}
          {frank ? (
            <li>
              <a
                className="rest-row"
                href={workHref(frank.slug)}
                data-images={imagesAttr(frank.images)}
              >
                <span
                  className="rest-shot"
                  style={{ backgroundImage: `url(${frank.images[0]})` }}
                />
                <span className="rest-name">{frank.short}</span>
                <span className="rest-role">UI/UX</span>
                <span className="rest-year">{frank.year}</span>
              </a>
            </li>
          ) : null}
          <li>
            <a
              className="rest-row is-more"
              href="/works"
              data-reel-label="The full index"
              data-images={moreImages}
            >
              <span className="rest-name">See more</span>
              <span className="rest-year">The full index</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
