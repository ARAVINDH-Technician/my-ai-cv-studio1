import "./Template1.css";
import type { ResumeData } from "./types";
import { ContactLine } from "./ContactLine";
import { roleLabels } from "./roleConfig";

const Section = ({ title, body }: { title: string; body: string }) =>
  body.trim() ? (
    <section className="tpl1__section">
      <h2 className="tpl1__heading">{title}</h2>
      <div className="tpl1__body">{body}</div>
    </section>
  ) : null;

export function Template1({ data }: { data: ResumeData }) {
  const labels = roleLabels[data.userRole];
  return (
    <article className="tpl1">
      <header className="tpl1__header">
        <h1 className="tpl1__name">{data.name || "Your Name"}</h1>
        <p className="tpl1__email"><ContactLine data={data} /></p>
      </header>

      {data.summary && (
        <section className="tpl1__section">
          <p className="tpl1__summary">{data.summary}</p>
        </section>
      )}

      <Section title="Projects" body={data.projects} />
      <Section title={labels.experience} body={data.internships} />
      <Section title={labels.education} body={data.education} />
      <Section title="Skills" body={data.skills} />
      <Section title="Certifications" body={data.certifications} />
      <Section title="Achievements" body={data.achievements} />
    </article>
  );
}
