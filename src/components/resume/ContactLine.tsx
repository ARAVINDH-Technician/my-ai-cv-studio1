import type { ResumeData } from "./types";

interface Props {
  data: ResumeData;
  separator?: string;
  className?: string;
}

/**
 * Renders the user's contact details (email, phone, location, links)
 * as a single line. Empty fields are skipped.
 */
export function ContactLine({ data, separator = " · ", className }: Props) {
  const items: string[] = [];
  if (data.email) items.push(data.email);
  if (data.phone) items.push(data.phone);
  if (data.location) items.push(data.location);
  if (data.linkedin) items.push(data.linkedin);
  if (data.github) items.push(data.github);
  if (data.portfolio) items.push(data.portfolio);

  if (items.length === 0) return <span className={className}>you@email.com</span>;
  return <span className={className}>{items.join(separator)}</span>;
}

/** Renders contact details as a vertical list (for sidebars). */
export function ContactList({ data, className }: Props) {
  const items: { label: string; value: string }[] = [];
  if (data.email) items.push({ label: "Email", value: data.email });
  if (data.phone) items.push({ label: "Phone", value: data.phone });
  if (data.location) items.push({ label: "Location", value: data.location });
  if (data.linkedin) items.push({ label: "LinkedIn", value: data.linkedin });
  if (data.github) items.push({ label: "GitHub", value: data.github });
  if (data.portfolio) items.push({ label: "Portfolio", value: data.portfolio });

  if (items.length === 0) return null;
  return (
    <ul className={className} style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((it) => (
        <li key={it.label} style={{ wordBreak: "break-all" }}>
          <strong style={{ fontWeight: 600 }}>{it.label}:</strong> {it.value}
        </li>
      ))}
    </ul>
  );
}
