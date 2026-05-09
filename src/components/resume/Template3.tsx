import "./Template3.css";
import type { ResumeData } from "./types";
import { ContactLine } from "./ContactLine";
import { roleLabels } from "./roleConfig";

const Row = ({ label, value }: { label: string; value: string }) =>
  value.trim() ? (
    <div className="tpl3__row">
      <div className="tpl3__label">{label}</div>
      <div className="tpl3__value">{value}</div>
    </div>
  ) : null;

export function Template3({ data }: { data: ResumeData }) {
  const labels = roleLabels[data.userRole];
  return (
    <article className="tpl3">
      <header className="tpl3__top">
        <h1 className="tpl3__name">{data.name || "Your Name"}</h1>
        <span className="tpl3__email"><ContactLine data={data} /></span>
      </header>
      {data.summary && (
        <div className="tpl3__row">
          <div className="tpl3__label">About</div>
          <div className="tpl3__value tpl3__summary">{data.summary}</div>
        </div>
      )}
      <Row label="Projects" value={data.projects} />
      <Row label={labels.experience} value={data.internships} />
      <Row label={labels.education} value={data.education} />
      <Row label="Skills" value={data.skills} />
      <Row label="Certifications" value={data.certifications} />
      <Row label="Achievements" value={data.achievements} />
    </article>
  );
}
