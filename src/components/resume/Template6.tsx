import "./Template6.css";
import type { ResumeData } from "./types";
import { ContactLine } from "./ContactLine";
import { roleLabels } from "./roleConfig";

const Section = ({ title, body }: { title: string; body: string }) =>
  body.trim() ? (
    <section className="tpl6__section">
      <h2 className="tpl6__h">{title}</h2>
      <div className="tpl6__body">{body}</div>
    </section>
  ) : null;

export function Template6({ data }: { data: ResumeData }) {
  const labels = roleLabels[data.userRole];
  return (
    <article className="tpl6">
      <header className="tpl6__head">
        <h1 className="tpl6__name">{data.name || "Your Name"}</h1>
        <div className="tpl6__rule" />
        <p className="tpl6__email"><ContactLine data={data} separator="  ·  " /></p>
      </header>
      {data.summary && <p className="tpl6__summary">{data.summary}</p>}
      <Section title="Projects" body={data.projects} />
      <Section title={labels.experience} body={data.internships} />
      <Section title={labels.education} body={data.education} />
      <Section title="Certifications" body={data.certifications} />
      <Section title="Achievements" body={data.achievements} />
      <Section title="Skills" body={data.skills} />
    </article>
  );
}
