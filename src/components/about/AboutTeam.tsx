import { getAbout } from "@/lib/data";

export function AboutTeam() {
  const { team } = getAbout();

  return (
    <section
      className="section section-people"
      data-tone-start="#1A1238"
      data-tone-end="#1A1238"
      data-tone-via="#1A1238@0.18,#160F30@0.42,#140E28@0.68,#140E28@0.90"
    >
      <header className="section-head">
        <p className="eyebrow">{team.eyebrow}</p>
        <h2 className="title">{team.title}</h2>
      </header>
      <ul className="values">
        {team.people.map((person) => (
          <li key={person.name}>
            <span>{person.name}</span>
            <em>{person.role}</em>
          </li>
        ))}
      </ul>
    </section>
  );
}
