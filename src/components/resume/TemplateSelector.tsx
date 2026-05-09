import type { TemplateId } from "./types";
import type React from "react";

const templates: { id: TemplateId; label: string }[] = [
  { id: "template1", label: "Professional" },
  { id: "template2", label: "Modern" },
  { id: "template3", label: "Minimal" },
  { id: "template4", label: "Compact" },
  { id: "template5", label: "Sidebar" },
  { id: "template6", label: "Executive" },
  { id: "template7", label: "Gradient" },
  { id: "template8", label: "ATS Friendly" },
];

interface Props {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  accentColor?: string;
}

export function TemplateSelector({ value, onChange, accentColor }: Props) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-2"
      style={accentColor ? ({ "--accent": accentColor } as React.CSSProperties) : undefined}
    >
      {templates.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`group rounded-lg border bg-card p-2 text-left transition-all ${
              active
                ? "border-primary shadow-sm"
                : "border-border hover:border-accent/40 hover:shadow-sm"
            }`}
            aria-pressed={active}
          >
            <span className={`block h-16 rounded-md border border-border bg-paper p-2 ${active ? "shadow-paper" : ""}`}>
              <span className="block h-2 w-1/2 rounded-sm bg-ink/80" />
              <span className="mt-2 block h-px w-full bg-rule" />
              <span className="mt-2 grid grid-cols-3 gap-1">
                <span className="col-span-2 space-y-1">
                  <span className="block h-1 rounded-sm bg-muted-foreground/40" />
                  <span className="block h-1 rounded-sm bg-muted-foreground/30" />
                  <span className="block h-1 rounded-sm bg-muted-foreground/30" />
                </span>
                <span className="space-y-1">
                  <span className="block h-1 rounded-sm bg-accent/70" />
                  <span className="block h-1 rounded-sm bg-muted-foreground/25" />
                  <span className="block h-1 rounded-sm bg-muted-foreground/25" />
                </span>
              </span>
            </span>
            <span className={`mt-2 block text-xs font-display ${active ? "text-foreground" : "text-muted-foreground"}`}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
