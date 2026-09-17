import { ArrowIcon } from "@/components/shell/ArrowIcon";

export function HomeIntro() {
  return (
    <section
      className="section section-intro"
      id="intro"
      data-tone-start="#0A0718"
      data-tone-end="#241A5E"
    >
      <div className="hero-crystal-clip" aria-hidden="true">
        <div className="crystal-x is-hero" />
      </div>
      <h1 className="display">
        <span className="mask">
          <span className="mask-in">We serve you,</span>
        </span>
        <span className="mask">
          <span className="mask-in dim">better.</span>
        </span>
      </h1>
      <div className="intro-body">
        <p className="lead">
          XERV is known as a custom software agency established by a team of five seasoned IT
          professionals who share a common passion for innovation and excellence. We run a lean
          structure supported by a talented pool of freelancers, so every engagement is shaped to the
          client&apos;s unique needs.
        </p>
        <p className="lead">
          As to our manifesto, we stand ready to be your trustworthy partner and provide IT services
          in a clear, understandable and effective approach.
        </p>
      </div>
      <a className="intro-start" href="#contact">
        Start a project
        <ArrowIcon />
      </a>
      <aside className="hero-dock">
        <div className="dock-card">
          <div className="dock-foil" aria-hidden="true" />
          <a
            className="dock-status"
            href="mailto:xerv.project@gmail.com"
            aria-label="Q4 — two seats open, email to start"
          >
            <span className="pulse" aria-hidden="true" />
            <span className="dock-q">Q4</span>
            <span className="dock-status-copy">Two seats open</span>
          </a>
          <p className="dock-line">
            Custom software for web, mobile, and the problems that will not fit a template.
          </p>
          <dl className="dock-facts">
            <div>
              <dt>Opened</dt>
              <dd>2023</dd>
            </div>
            <div>
              <dt>Studio</dt>
              <dd>Five principals</dd>
            </div>
            <div>
              <dt>Now</dt>
              <dd>Two seats</dd>
            </div>
          </dl>
        </div>
      </aside>
      <a className="scroll-hint" href="#approach">
        <span className="scroll-mouse" aria-hidden="true">
          <i />
        </span>
        Scroll
      </a>
    </section>
  );
}
