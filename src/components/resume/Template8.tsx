import "./Template8.css";
import type { ResumeData } from "./types";
import { ContactLine } from "./ContactLine";
import { roleLabels } from "./roleConfig";

const Section = ({ title, body }: { title: string; body: string }) =>
  body.trim() ? (
    <section className="tpl8__section">
      <h2 className="tpl8__heading">{title}</h2>
      <div className="tpl8__body">{body}</div>
    </section>
  ) : null;

export function Template8({ data }: { data: ResumeData }) {
  const labels = roleLabels[data.userRole];
  return (
    <article className="tpl8">
      <header className="tpl8__header">
        <h1 className="tpl8__name">{data.name || "Your Name"}</h1>
        <p className="tpl8__contact">
          <ContactLine data={data} separator=" | " />
        </p>
      </header>

      {data.summary && (
        <section className="tpl8__section">
          <h2 className="tpl8__heading">{labels.summary}</h2>
          <p className="tpl8__summary">{data.summary}</p>
        </section>
      )}

      <Section title="Skills" body={data.skills} />
      <Section title="Projects" body={data.projects} />
      <Section title={labels.experience} body={data.internships} />
      <Section title={labels.education} body={data.education} />
      <Section title="Certifications" body={data.certifications} />
      <Section title="Achievements" body={data.achievements} />
    </article>
  );
}
