import { useEffect, useState } from "react";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { SavedResume, TemplateId } from "./types";
import { RESUME_THEME_COLORS, TEMPLATE_IDS } from "./types";

type SavedResumeRow = Omit<SavedResume, "themeColor" | "template"> & {
  template: string;
  theme_color?: string;
};

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  template1: "Professional",
  template2: "Modern",
  template3: "Minimal",
  template4: "Compact",
  template5: "Sidebar",
  template6: "Executive",
  template7: "Gradient",
  template8: "ATS Friendly",
};

interface Props {
  refreshKey: number;
  onLoad: (r: SavedResume) => void;
  currentId: string | null;
  onDeleted: (id: string) => void;
}

const localResumeKey = (userId: string) => `inkwell_resumes_${userId}`;

const mapRow = (r: SavedResumeRow): SavedResume => ({
  ...r,
  template: (TEMPLATE_IDS.includes(r.template as TemplateId) ? r.template : "template1") as TemplateId,
  themeColor: r.theme_color ?? RESUME_THEME_COLORS[0],
});

export function SavedResumes({ refreshKey, onLoad, currentId, onDeleted }: Props) {
  const { user, loading: authLoading, isLocalUser } = useAuth();
  const [items, setItems] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    if (!user && !authLoading) {
      setItems([]);
      setLoading(false);
      return;
    }

    if (!user) return;

    if (isLocalUser) {
      try {
        const localRows = JSON.parse(localStorage.getItem(localResumeKey(user.id)) ?? "[]") as SavedResumeRow[];
        setItems(localRows.map(mapRow));
      } catch {
        setItems([]);
      }
      setLoading(false);
      return;
    }

    supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error(error);
        setItems(((data ?? []) as SavedResumeRow[]).map(mapRow));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey, user, authLoading, isLocalUser]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to delete resumes");
      return;
    }
    if (!confirm("Delete this resume? This can't be undone.")) return;
    setDeletingId(id);
    if (isLocalUser) {
      try {
        const localRows = JSON.parse(localStorage.getItem(localResumeKey(user.id)) ?? "[]") as SavedResumeRow[];
        const next = localRows.filter((r) => r.id !== id);
        localStorage.setItem(localResumeKey(user.id), JSON.stringify(next));
      } catch {
        localStorage.setItem(localResumeKey(user.id), "[]");
      }
      setDeletingId(null);
      setItems((prev) => prev.filter((r) => r.id !== id));
      onDeleted(id);
      toast.success("Resume deleted");
      return;
    }

    const { error } = await supabase.from("resumes").delete().eq("id", id).eq("user_id", user.id);
    setDeletingId(null);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    setItems((prev) => prev.filter((r) => r.id !== id));
    onDeleted(id);
    toast.success("Resume deleted");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        No saved resumes yet. Save one to see it here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((r) => (
        <li key={r.id} className={`flex items-center gap-2 ${currentId === r.id ? "bg-accent/5" : ""}`}>
          <button
            onClick={() => onLoad(r)}
            className="flex-1 text-left py-3 flex items-center gap-3 group hover:text-accent transition-colors min-w-0"
          >
            <FileText className="h-4 w-4 text-muted-foreground group-hover:text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {r.name}
                {currentId === r.id && (
                  <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-accent">Editing</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">{r.email}</div>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              {TEMPLATE_LABELS[r.template]}
            </span>
          </button>
          <button
            onClick={(e) => handleDelete(r.id, e)}
            disabled={deletingId === r.id}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            aria-label="Delete resume"
          >
            {deletingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </li>
      ))}
    </ul>
  );
}
