import "./Template5.css";
import type { ResumeData } from "./types";
import { ContactLine } from "./ContactLine";
import { roleLabels } from "./roleConfig";

const Block = ({ title, body }: { title: string; body: string }) =>
  body.trim() ? (
    <>
      <h2 className="tpl5__h">{title}</h2>
      <div className="tpl5__body">{body}</div>
    </>
  ) : null;

export function Template5({ data }: { data: ResumeData }) {
  const labels = roleLabels[data.userRole];
  return (
    <article className="tpl5">
      <h1 className="tpl5__name">{data.name || "Your Name"}</h1>
      <p className="tpl5__email"># <ContactLine data={data} separator=" | " /></p>

      {data.summary && (
        <>
          <h2 className="tpl5__h">{labels.summary.toLowerCase()}</h2>
          <p className="tpl5__summary">{data.summary}</p>
        </>
      )}
      <Block title="projects" body={data.projects} />
      <Block title={labels.experience.toLowerCase()} body={data.internships} />
      <Block title="skills" body={data.skills} />
      <Block title={labels.education.toLowerCase()} body={data.education} />
      <Block title="certifications" body={data.certifications} />
      <Block title="achievements" body={data.achievements} />
    </article>
  );
}
