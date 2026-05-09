import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESUME_FIELDS = [
  "name",
  "email",
  "skills",
  "projects",
  "internships",
  "achievements",
  "certifications",
  "education",
  "summary",
] as const;

const toolSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string" },
    skills: { type: "string", description: "Comma-separated list of skills." },
    projects: { type: "string", description: "Multi-line projects. One project per block, separated by blank lines. Each block: title — short description with tech and impact." },
    internships: { type: "string", description: "Multi-line internships. One per block. Role, company, duration, then 1-2 outcome lines." },
    achievements: { type: "string", description: "Multi-line achievements. One per line, action-oriented." },
    certifications: { type: "string", description: "Multi-line certifications. One per line: name, issuer, year." },
    education: { type: "string", description: "Multi-line education entries." },
    summary: { type: "string", description: "3-4 sentence professional summary." },
  },
  required: [...RESUME_FIELDS],
  additionalProperties: false,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const mode: "build" | "rewrite" = body.mode === "rewrite" ? "rewrite" : "build";

    let userMessage = "";
    if (mode === "rewrite") {
      const r = body.resume ?? {};
      userMessage = `Rewrite the following raw resume content into polished, recruiter-ready prose. Keep the same facts (names, dates, companies) but rephrase every section professionally. Use strong action verbs. Quantify impact where reasonable.

Existing data:
Name: ${r.name || ""}
Email: ${r.email || ""}
Skills: ${r.skills || ""}
Projects:
${r.projects || ""}
Internships:
${r.internships || ""}
Achievements:
${r.achievements || ""}
Certifications:
${r.certifications || ""}
Education:
${r.education || ""}
Summary: ${r.summary || ""}

Return all fields, polished. Do not invent companies, dates, or credentials that aren't implied.`;
    } else {
      const prompt = body.prompt;
      if (!prompt || typeof prompt !== "string") {
        return new Response(JSON.stringify({ error: "Missing prompt" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userMessage = prompt;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume writer for students and early-career professionals. Produce polished, recruiter-friendly resumes structured by Projects, Internships, Achievements, Certifications, Education, and Skills (no generic 'Experience' section). Write a confident 3-4 sentence summary. Use strong action verbs and concrete impact. Skills must be a comma-separated list. For multi-line sections, use plain text with one entry per block separated by blank lines. Never invent facts not implied by the input. Plain text only — no Markdown.",
          },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "build_resume",
              description: "Return structured resume fields.",
              parameters: toolSchema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "build_resume" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await resp.text();
      console.error("AI gateway error:", resp.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = call?.function?.arguments;
    if (!argsStr) {
      console.error("No tool_call in response", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(argsStr);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid AI response" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resume: Record<string, string> = {};
    for (const f of RESUME_FIELDS) resume[f] = String(parsed[f] ?? "");

    return new Response(JSON.stringify({ resume }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("build-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
