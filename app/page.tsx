"use client";

import { useState } from "react";
import type { Grade, Difficulty, QuestionType, Question } from "@/lib/types";
import { QuestionCard } from "@/components/QuestionCard";

const GRADES: Grade[] = ["初一", "初二", "初三", "高一", "高二", "高三"];
const DIFFS: Difficulty[] = ["易", "中", "难"];
const TYPES: QuestionType[] = ["选择题", "填空题"];

export default function Home() {
  const [grade, setGrade] = useState<Grade>("初一");
  const [kp, setKp] = useState("");
  const [diff, setDiff] = useState<Difficulty>("中");
  const [qt, setQt] = useState<QuestionType>("选择题");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  const gen = async () => {
    if (!kp.trim()) {
      setError("请填写知识点");
      return;
    }
    setLoading(true);
    setError("");
    setQuestions([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          knowledgePoint: kp,
          difficulty: diff,
          questionType: qt,
          count,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setQuestions(data.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">初高中数学出题</h1>
        <p className="mt-1 text-gray-600 text-sm">
          AI 自动生成数学题（选择 / 填空），KaTeX 渲染公式，一键复制。
        </p>
      </header>

      <section className="border rounded-lg p-4 bg-white space-y-3 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            年级
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as Grade)}
              className="mt-1 w-full border rounded px-2 py-1 bg-white"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            题型
            <select
              value={qt}
              onChange={(e) => setQt(e.target.value as QuestionType)}
              className="mt-1 w-full border rounded px-2 py-1 bg-white"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            难度
            <select
              value={diff}
              onChange={(e) => setDiff(e.target.value as Difficulty)}
              className="mt-1 w-full border rounded px-2 py-1 bg-white"
            >
              {DIFFS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            题量 (1-5)
            <input
              type="number"
              min={1}
              max={5}
              value={count}
              onChange={(e) =>
                setCount(
                  Math.max(1, Math.min(5, Number(e.target.value) || 1))
                )
              }
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </label>
        </div>
        <label className="text-sm block">
          知识点
          <input
            value={kp}
            onChange={(e) => setKp(e.target.value)}
            placeholder="如：一元二次方程的解法"
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
        <button
          onClick={gen}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "生成中..." : "生成题目"}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </section>

      <section className="space-y-3">
        {questions.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i + 1} />
        ))}
      </section>
    </main>
  );
}
