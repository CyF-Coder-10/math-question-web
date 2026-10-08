import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "初高中数学出题",
  description: "AI 自动生成初高中数学题（选择题 / 填空题）",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
