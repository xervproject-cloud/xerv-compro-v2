import { ArrowIcon } from "@/components/shell/ArrowIcon";
import { getAbout } from "@/lib/data";

type ContactFooterProps = {
  toneStart?: string;
  toneEnd?: string;
  withBox?: boolean;
};

export function ContactFooter({
  toneStart = "#0A0718",
  toneEnd = "#0A0718",
  withBox = false,
}: ContactFooterProps) {
  const { contact } = getAbout();
  const year = new Date().getFullYear();

  return (
    <footer
      className="section section-contact"
      id="contact"
      data-tone-start={toneStart}
      data-tone-end={toneEnd}
      data-tone-box={withBox ? "" : undefined}
    >
      <div className="crystal-x" aria-hidden="true" />
      <div className="contact-head">
        <div className="contact-copy">
          <p className="eyebrow">Enquiries</p>
          <h2 className="display display-sm">
            <span className="mask">
              <span className="mask-in">Tell us what</span>
            </span>
            <span className="mask">
              <span className="mask-in dim">is at stake.</span>
            </span>
          </h2>
          <p className="contact-note">{contact.note}</p>
        </div>
        <div className="contact-reach">
          <div className="contact-meta">
            <div>
              <p className="meta-key">Telephone</p>
              <p className="meta-val">{contact.telephone}</p>
            </div>
            <div>
              <p className="meta-key">Studio</p>
              <p className="meta-val">{contact.studio}</p>
            </div>
          </div>
          <a className="contact-mail" href={`mailto:${contact.email}`}>
            <span className="contact-mail-addr">{contact.email}</span>
            <ArrowIcon />
          </a>
        </div>
      </div>
      <div className="foot">
        <span>XERV Project — Custom Software Agency</span>
        <span>
          © <span id="year">{year}</span> — All rights reserved
        </span>
      </div>
    </footer>
  );
}
