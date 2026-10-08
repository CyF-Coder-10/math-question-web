import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/deepseek";
import type { GenerateRequest } from "@/lib/types";

// Vercel serverless 免费档 ~10s 超时，限制单次题量
export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest;

    // 服务端校验
    const { count, grade, knowledgePoint, difficulty, questionType } = body;
    if (!count || count < 1 || count > 5) {
      return NextResponse.json(
        { error: "题量需在 1-5 之间（Vercel 免费档超时限制）" },
        { status: 400 }
      );
    }
    if (!grade || !knowledgePoint || !difficulty || !questionType) {
      return NextResponse.json(
        { error: "缺少必要参数（年级/知识点/难度/题型）" },
        { status: 400 }
      );
    }

    const questions = await generateQuestions(body);
    return NextResponse.json({ questions });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
