"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders Claude's markdown output with our Lumi prose styling. */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-lumi">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
