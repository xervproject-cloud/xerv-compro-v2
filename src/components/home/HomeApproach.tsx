export function HomeApproach() {
  return (
    <section
      className="section section-approach"
      id="approach"
      data-tone-start="#2A1F6E"
      data-tone-end="#5B4CA6"
    >
      <header className="section-head">
        <p className="eyebrow">The Solution Approach</p>
        <h2 className="title">Three principles we operate on, every single engagement.</h2>
      </header>
      <div className="approach-board">
        <article className="approach-col">
          <figure className="approach-fig">
            <img src="/assets/approach-custom.webp" alt="" width={849} height={594} />
          </figure>
          <h3>Custom Software Development</h3>
          <p>Tailored solutions for web, mobile and enterprise systems.</p>
        </article>
        <article className="approach-col">
          <figure className="approach-fig">
            <img src="/assets/approach-engagement.webp" alt="" width={938} height={401} />
          </figure>
          <h3>Flexible Engagement Models</h3>
          <p>
            Full-time and part-time opportunities for developers, and scalable teams for clients.
          </p>
        </article>
        <article className="approach-col">
          <figure className="approach-fig">
            <img src="/assets/approach-e2e.webp" alt="" width={1026} height={636} />
          </figure>
          <h3>End-to-End Solutions</h3>
          <p>From concept to deployment and beyond, we ensure seamless project execution.</p>
        </article>
      </div>
    </section>
  );
}
