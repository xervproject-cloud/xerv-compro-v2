import { getAbout } from "@/lib/data";

export function AboutDirection() {
  const { direction } = getAbout();

  return (
    <section
      className="section section-direction"
      data-tone-start="#2A1F6E"
      data-tone-end="#241A5E"
      data-tone-via="#241A5E@0.45,#1E1638@0.88"
    >
      <header className="section-head">
        <p className="eyebrow">{direction.eyebrow}</p>
        <h2 className="title">{direction.title}</h2>
      </header>
      <div className="note-grid">
        <div className="note-block">
          <p className="note-key">Vision</p>
          <p className="note-copy">{direction.vision}</p>
        </div>
        <div className="note-block">
          <p className="note-key">Mission</p>
          <p className="note-copy">{direction.mission}</p>
        </div>
      </div>
      <ul className="values">
        {direction.values.map((value) => (
          <li key={value.name}>
            <span>{value.name}</span>
            <em>{value.copy}</em>
          </li>
        ))}
      </ul>
    </section>
  );
}
