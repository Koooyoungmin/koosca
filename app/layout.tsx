import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "구영민必학원 독서실",
  description: "관리형 독서실 학습 관리 시스템 — 학습시간 · 계획 · 성취율을 실시간으로 관리",
  manifest: "/manifest.webmanifest",
  themeColor: "#1e3a8a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "구영민독서실",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-brand-50">{children}</body>
    </html>
  );
}
