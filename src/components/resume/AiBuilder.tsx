import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ResumeData, UserRole } from "./types";
import { roleAiHints, rolePromptExamples } from "./roleConfig";

interface Props {
  userRole: UserRole;
  onBuilt: (fields: Omit<ResumeData, "template" | "themeColor">) => void;
}

export function AiBuilder({ userRole, onBuilt }: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const example = rolePromptExamples[userRole];

  const run = async () => {
    const text = prompt.trim();
    if (text.length < 15) {
      toast.error("Add a few more details first");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("build-resume", {
        body: { prompt: text, userRole, suggestions: roleAiHints[userRole] },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.resume) throw new Error("No resume returned");
      onBuilt(data.resume);
      toast.success("Resume drafted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to build");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={`Describe yourself in a paragraph and AI will fill the form.\n\ne.g. "${example}"`}
        className="resize-none"
      />
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setPrompt(example)}
          className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
        >
          Try example
        </button>
        <Button
          onClick={run}
          disabled={loading}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
          {loading ? "Building…" : "Build with AI"}
        </Button>
      </div>
    </div>
  );
}
