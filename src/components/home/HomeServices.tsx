import { ArrowIcon } from "@/components/shell/ArrowIcon";
import { getServices } from "@/lib/data";

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="3" width="10" height="18" rx="1.6" />
      <path d="M10 18.5h4" />
    </svg>
  ),
  web: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.4 2.6 3.6 5.4 3.6 8s-1.2 5.4-3.6 8c-2.4-2.6-3.6-5.4-3.6-8s1.2-5.4 3.6-8z" />
    </svg>
  ),
  uiux: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="12" rx="1.2" />
      <path d="M8 17.5 10.5 21h3L16 17.5" />
    </svg>
  ),
  qa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.2 2.4 2.4 4.6-5" />
    </svg>
  ),
  manpower: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8.5" r="2.2" />
      <circle cx="15.5" cy="8.8" r="1.8" />
      <path d="M4.8 18c.4-2.6 2.4-4 4.3-4s3.9 1.4 4.3 4M13 14.2c1.7 0 3.4 1.1 3.8 3.3" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.2 18.8 12.6 11.4" />
      <path d="M15.5 3.8 16.55 7.7 20.45 8.75 16.55 9.8 15.5 13.7 14.45 9.8 10.55 8.75 14.45 7.7Z" />
      <path d="M6.5 4.8v2.8M5.1 6.2h2.8" />
      <path d="M18.6 15.4v2.4M17.4 16.6h2.4" />
    </svg>
  ),
};

const CTA_LABELS: Record<string, string> = {
  mobile: "Start a mobile build",
  web: "Start a web project",
  uiux: "Start a design engagement",
  qa: "Start a QA engagement",
  manpower: "Embed a team",
  ai: "Start an AI engagement",
  custom: "Start a custom build",
};

export function HomeServices() {
  const services = getServices().filter((service) => service.id !== "custom");
  const email = "xerv.project@gmail.com";

  return (
    <section
      className="section section-disciplines"
      id="services"
      data-tone-start="#CBC5DE"
      data-tone-end="#EFEDE9"
    >
      <header className="section-head">
        <p className="eyebrow">Services — 07</p>
        <h2 className="title">
          Through its technologies, XERV
          <br />
          continues to assist in transforming
          <br />
          <span className="title-keep">small concerns into comprehensive solutions.</span>
        </h2>
      </header>

      <ul className="disciplines">
        {services.map((service) => (
          <li key={service.id} style={{ ["--svc-accent" as string]: service.accent }}>
            <span className="d-blob" aria-hidden="true" />
            <div className="d-stack">
              <span className="d-icon" aria-hidden="true">
                {SERVICE_ICONS[service.id]}
              </span>
              <h3>{service.name}</h3>
              <div className="d-more">
                <div className="d-more-in">
                  <p>{service.copy}</p>
                  <a
                    className="d-cta"
                    href={`mailto:${email}?subject=${encodeURIComponent(service.name)}`}
                  >
                    {CTA_LABELS[service.id] ?? "Start a project"}
                    <ArrowIcon />
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
        <li className="is-wide">
          <span className="d-blob" aria-hidden="true" />
          <div className="d-stack">
            <div className="d-copy">
              <h3>Need a custom solution?</h3>
              <div className="d-more">
                <div className="d-more-in">
                  <p>
                    If the problem will not fit a template, we still take it — and we build the
                    system around that problem.
                  </p>
                </div>
              </div>
            </div>
            <a
              className="d-cta"
              href={`mailto:${email}?subject=${encodeURIComponent("Custom Solution")}`}
            >
              Start a custom build
              <ArrowIcon />
            </a>
          </div>
        </li>
      </ul>
    </section>
  );
}
