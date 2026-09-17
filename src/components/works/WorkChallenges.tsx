import type { Work } from "@/lib/types";

type WorkChallengesProps = {
  work: Work;
};

export function WorkChallenges({ work }: WorkChallengesProps) {
  return (
    <section
      className="section"
      id="challenges"
      data-tone-start="#2A1F6E"
      data-tone-end="#241A5E"
    >
      <header className="section-head">
        <p className="eyebrow">Challenges</p>
        <h2 className="title">What was at stake before we started.</h2>
      </header>
      <div className="note-grid">
        {work.challenges.map((item) => (
          <div className="note-block" key={item.title}>
            <p className="note-key">{item.title}</p>
            <p className="note-copy">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
