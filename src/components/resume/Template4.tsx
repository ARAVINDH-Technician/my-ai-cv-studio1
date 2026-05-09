import "./Template4.css";
import type { ResumeData } from "./types";
import { ContactLine } from "./ContactLine";
import { roleLabels } from "./roleConfig";

const Block = ({ title, body }: { title: string; body: string }) =>
  body.trim() ? (
    <>
      <h2 className="tpl4__h">{title}</h2>
      <div className="tpl4__body">{body}</div>
    </>
  ) : null;

export function Template4({ data }: { data: ResumeData }) {
  const labels = roleLabels[data.userRole];
  return (
    <article className="tpl4">
      <header className="tpl4__head">
        <h1 className="tpl4__name">{data.name || "Your Name"}</h1>
        <span className="tpl4__chip">CV</span>
      </header>
      <div className="tpl4__email"><ContactLine data={data} /></div>
      {data.summary && <p className="tpl4__summary">{data.summary}</p>}
      <div className="tpl4__cols">
        <div>
          <Block title="Projects" body={data.projects} />
          <Block title={labels.experience} body={data.internships} />
        </div>
        <div>
          <Block title="Skills" body={data.skills} />
          <Block title={labels.education} body={data.education} />
          <Block title="Certifications" body={data.certifications} />
          <Block title="Achievements" body={data.achievements} />
        </div>
      </div>
    </article>
  );
}
