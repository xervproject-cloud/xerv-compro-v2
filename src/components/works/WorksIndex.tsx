import {
  getServices,
  getWorksIndex,
  imagesAttr,
  workHref,
} from "@/lib/data";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "mobile", label: "Mobile", title: "Mobile Application Development" },
  { id: "web", label: "Web", title: "Web Development" },
  { id: "custom", label: "Custom", title: "Custom Solution" },
  { id: "uiux", label: "UI/UX", title: "UI/UX Design" },
] as const;

export function WorksIndex() {
  const works = getWorksIndex();
  const services = getServices();
  const shortById = Object.fromEntries(services.map((service) => [service.id, service.short]));

  return (
    <section
      className="section section-works"
      data-tone-start="#0A0718"
      data-tone-end="#0A0718"
    >
      <header className="section-head works-head">
        <p className="eyebrow">Works — {works.length}</p>
        <h1 className="display display-sm">
          <span className="mask">
            <span className="mask-in">Name, discipline, year.</span>
          </span>
          <span className="mask">
            <span className="mask-in dim">Then the write-up.</span>
          </span>
        </h1>
        <div className="work-filter-scroller">
          <div className="work-filter" role="group" aria-label="Filter by service">
            {FILTERS.map((filter, index) => (
              <button
                key={filter.id}
                type="button"
                className={`work-filter-btn${index === 0 ? " is-on" : ""}`}
                data-filter={filter.id}
                aria-pressed={index === 0}
                title={"title" in filter ? filter.title : undefined}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      <ul className="rest-list works-index">
        {works.map((work) => (
          <li key={work.slug} data-services={work.services.join(" ")}>
            <a
              className="rest-row"
              href={workHref(work.slug)}
              data-images={imagesAttr(work.images)}
            >
              <span
                className="rest-shot"
                style={{ backgroundImage: `url(${work.images[0]})` }}
              />
              <span className="rest-name">{work.name}</span>
              <span className="rest-role">
                {work.services.map((id) => shortById[id] ?? id).join(" · ")}
              </span>
              <span className="rest-year">{work.year}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
