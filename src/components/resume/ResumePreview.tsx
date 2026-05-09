import { Template1 } from "./Template1";
import type React from "react";
import { Template2 } from "./Template2";
import { Template3 } from "./Template3";
import { Template4 } from "./Template4";
import { Template5 } from "./Template5";
import { Template6 } from "./Template6";
import { Template7 } from "./Template7";
import { Template8 } from "./Template8";
import type { ResumeData } from "./types";
import { toPreviewData } from "./roleConfig";

export function ResumePreview({ data }: { data: ResumeData }) {
  const previewData = toPreviewData(data);
  const map = {
    template1: Template1,
    template2: Template2,
    template3: Template3,
    template4: Template4,
    template5: Template5,
    template6: Template6,
    template7: Template7,
    template8: Template8,
  } as const;
  const Tpl = map[previewData.template] ?? Template1;
  return (
    <div
      className="rounded-lg overflow-hidden bg-paper shadow-paper border border-border"
      style={{ "--accent": previewData.themeColor } as React.CSSProperties}
    >
      <Tpl data={previewData} />
    </div>
  );
}
