"use client";

import { useState, type ReactNode } from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import type { Question } from "@/lib/types";

// 解析含 $...$ 行内与 $$...$$ 块级公式的字符串，分段渲染
function renderRichText(text: string, baseKey: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const blockSplit = text.split(/(\$\$[^]+?\$\$)/g);
  blockSplit.forEach((seg, i) => {
    if (seg.startsWith("$$") && seg.endsWith("$$") && seg.length > 4) {
      parts.push(<BlockMath key={`${baseKey}-b${i}`} math={seg.slice(2, -2)} />);
    } else if (seg) {
      const inlineSplit = seg.split(/(\$[^$]+?\$)/g);
      inlineSplit.forEach((s, j) => {
        if (s.startsWith("$") && s.endsWith("$") && s.length > 1) {
          parts.push(
            <InlineMath key={`${baseKey}-i${i}-${j}`} math={s.slice(1, -1)} />
          );
        } else if (s) {
          parts.push(<span key={`${baseKey}-t${i}-${j}`}>{s}</span>);
        }
      });
    }
  });
  return parts;
}

export function QuestionCard({ q, index }: { q: Question; index: number }) {
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    let t = `${index}. ${q.stem.replace(/\$\$?/g, "")}\n`;
    if (q.type === "选择题") {
      t += q.options.map((o) => o.replace(/\$\$?/g, "")).join("\n") + "\n";
    }
    t += `答案：${q.answer}`;
    if (q.analysis) t += `\n解析：${q.analysis.replace(/\$\$?/g, "")}`;
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start gap-2">
        <div className="font-medium">
          {index}. [{q.type}]
        </div>
        <button
          onClick={copyText}
          className="text-sm px-2 py-1 rounded border hover:bg-gray-50"
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <div className="mt-2 leading-relaxed">
        {renderRichText(q.stem, `s${index}`)}
      </div>
      {q.type === "选择题" && (
        <ul className="mt-2 space-y-0.5">
          {q.options.map((o, i) => (
            <li key={i} className="leading-relaxed">
              {renderRichText(o, `o${index}-${i}`)}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 text-sm text-green-700">
        答案：{renderRichText(q.answer, `a${index}`)}
      </div>
      {q.analysis && (
        <div className="mt-1 text-sm text-gray-600">
          解析：{renderRichText(q.analysis, `an${index}`)}
        </div>
      )}
    </div>
  );
}
