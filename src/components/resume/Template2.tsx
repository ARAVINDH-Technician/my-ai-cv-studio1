import "./Template2.css";
import type { ResumeData } from "./types";
import { ContactList } from "./ContactLine";
import { roleLabels } from "./roleConfig";

export function Template2({ data }: { data: ResumeData }) {
  const labels = roleLabels[data.userRole];
  return (
    <article className="tpl2">
      <aside className="tpl2__sidebar">
        <h1 className="tpl2__name">{data.name || "Your Name"}</h1>
        <span className="tpl2__role">Resume</span>
        <div className="tpl2__email">
          <ContactList data={data} />
        </div>

        {data.skills && (<><h3 className="tpl2__sideHeading">Skills</h3><div className="tpl2__sideBody">{data.skills}</div></>)}
        {data.education && (<><h3 className="tpl2__sideHeading">{labels.education}</h3><div className="tpl2__sideBody">{data.education}</div></>)}
        {data.certifications && (<><h3 className="tpl2__sideHeading">Certifications</h3><div className="tpl2__sideBody">{data.certifications}</div></>)}
      </aside>

      <main className="tpl2__main">
        {data.summary && <p className="tpl2__summary">{data.summary}</p>}
        {data.projects && (
          <section className="tpl2__section">
            <h2 className="tpl2__heading">Projects</h2>
            <div className="tpl2__body">{data.projects}</div>
          </section>
        )}
        {data.internships && (
          <section className="tpl2__section">
            <h2 className="tpl2__heading">{labels.experience}</h2>
            <div className="tpl2__body">{data.internships}</div>
          </section>
        )}
        {data.achievements && (
          <section className="tpl2__section">
            <h2 className="tpl2__heading">Achievements</h2>
            <div className="tpl2__body">{data.achievements}</div>
          </section>
        )}
      </main>
    </article>
  );
}
