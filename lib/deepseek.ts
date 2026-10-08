import type { GenerateRequest, Question } from "./types";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

function buildPrompt(req: GenerateRequest): string {
  const { grade, knowledgePoint, difficulty, questionType, count } = req;
  const schemaExample =
    questionType === "选择题"
      ? `{
  "questions": [
    {
      "type": "选择题",
      "stem": "题干文本，公式用 $...$ 包裹，例如 $\\\\frac{1}{2}$",
      "options": ["A. 选项一", "B. 选项二", "C. 选项三", "D. 选项四"],
      "answer": "B",
      "analysis": "解析（可选）"
    }
  ]
}`
      : `{
  "questions": [
    {
      "type": "填空题",
      "stem": "题干文本，空处用 _____ 表示，公式用 $...$ 包裹",
      "answer": "答案",
      "analysis": "解析（可选）"
    }
  ]
}`;

  return `你是一名经验丰富的中国${grade}数学教师。请根据以下要求出题：

- 年级：${grade}
- 知识点：${knowledgePoint}
- 难度：${difficulty}
- 题型：${questionType}
- 题量：${count} 道

严格要求：
1. 题目内容符合中国${grade}数学课程标准，知识点准确无误，答案必须正确。
2. 数学公式一律使用标准 LaTeX 语法，行内公式用 $...$ 包裹，块级公式用 $$...$$ 包裹，确保能被 KaTeX 直接渲染。
3. 不要使用 \\boldsymbol、\\text{}、\\mathrm 等非必要宏包命令；只用 KaTeX 支持的常用命令（\\frac、\\sqrt、^、_、\\sum、\\int 等）。
4. 题目不得重复，难度一致。
5. 严格输出 JSON 对象，不要任何额外文字、不要 markdown 代码块包裹。格式如下：

${schemaExample}

请输出恰好 ${count} 道题。`;
}

export async function generateQuestions(
  req: GenerateRequest
): Promise<Question[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 未配置（请在 .env.local 填入）");
  }

  const prompt = buildPrompt(req);

  const res = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是一名严谨的中国中学数学教师，擅长按要求出题并输出严格的结构化 JSON。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API 错误 ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(
      "DeepSeek 返回内容无法解析为 JSON: " + content.slice(0, 200)
    );
  }

  // 兼容 {questions: [...]} / 直接数组 / 单对象
  let arr: unknown;
  if (Array.isArray(parsed)) {
    arr = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { questions?: unknown }).questions)
  ) {
    arr = (parsed as { questions: unknown[] }).questions;
  } else if (parsed && typeof parsed === "object") {
    arr = [parsed];
  } else {
    throw new Error("DeepSeek 返回 JSON 格式不符合预期");
  }

  return (arr as Record<string, unknown>[]).map((q, i) => ({
    id: `q-${Date.now()}-${i}`,
    ...q,
  })) as Question[];
}
