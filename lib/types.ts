// 题目类型定义

export type Grade =
  | "初一"
  | "初二"
  | "初三"
  | "高一"
  | "高二"
  | "高三";

export type QuestionType = "选择题" | "填空题";

export type Difficulty = "易" | "中" | "难";

export interface GenerateRequest {
  grade: Grade;
  knowledgePoint: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  count: number;
}

export interface ChoiceQuestion {
  id: string;
  type: "选择题";
  stem: string; // 题干，可能含 LaTeX（$...$ 行内、$$...$$ 块级）
  options: string[]; // 选项，形如 "A. ..."，可能含 LaTeX
  answer: string; // 正确答案字母，如 "B"
  analysis?: string; // 解析（可选）
}

export interface FillBlankQuestion {
  id: string;
  type: "填空题";
  stem: string; // 题干，空处用 _____ 表示
  answer: string;
  analysis?: string;
}

export type Question = ChoiceQuestion | FillBlankQuestion;

export interface GenerateResponse {
  questions: Question[];
}
