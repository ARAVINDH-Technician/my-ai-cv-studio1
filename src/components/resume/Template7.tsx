import "./Template7.css";
import type { ResumeData } from "./types";
import { ContactLine } from "./ContactLine";
import { roleLabels } from "./roleConfig";

const Card = ({ title, body }: { title: string; body: string }) =>
  body.trim() ? (
    <section className="tpl7__card">
      <h2 className="tpl7__h">{title}</h2>
      <div className="tpl7__body">{body}</div>
    </section>
  ) : null;

export function Template7({ data }: { data: ResumeData }) {
  const labels = roleLabels[data.userRole];
  return (
    <article className="tpl7">
      <header className="tpl7__hero">
        <h1 className="tpl7__name">{data.name || "Your Name"}</h1>
        <p className="tpl7__email"><ContactLine data={data} /></p>
        {data.summary && <p className="tpl7__summary">{data.summary}</p>}
      </header>
      <div className="tpl7__grid">
        <Card title="Projects" body={data.projects} />
        <Card title={labels.experience} body={data.internships} />
        <Card title="Skills" body={data.skills} />
        <Card title={labels.education} body={data.education} />
        <Card title="Certifications" body={data.certifications} />
        <Card title="Achievements" body={data.achievements} />
      </div>
    </article>
  );
}
