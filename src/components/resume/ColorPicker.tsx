import { RESUME_THEME_COLORS } from "./types";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      {RESUME_THEME_COLORS.map((color) => {
        const active = color.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            aria-label={`Use accent color ${color}`}
            aria-pressed={active}
            onClick={() => onChange(color)}
            className={`h-6 w-6 rounded-full border transition-all ${
              active ? "border-primary ring-2 ring-accent/20" : "border-border hover:border-accent/50"
            }`}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}
