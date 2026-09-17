import type { Work } from "@/lib/types";

type WorkQuoteProps = {
  work: Work;
};

export function WorkQuote({ work }: WorkQuoteProps) {
  return (
    <section
      className="section cs-quote"
      id="quote"
      data-tone-start="#1A1238"
      data-tone-end="#1A1238"
    >
      <blockquote>
        <p className="lead">{work.quote.lead}</p>
        <footer>
          <cite>{work.quote.name}</cite>
          <span>{work.quote.role}</span>
        </footer>
      </blockquote>
    </section>
  );
}
