"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import { Timer, ClipboardList, BarChart2, Bell, ArrowRight } from "lucide-react";

const QUOTES = [
  "배움에는 끝이 없다. — Robert Schumann",
  "오늘 걷지 않으면 내일은 뛰어야 한다.",
  "공부할 때의 고통은 잠깐이지만, 못 배운 고통은 평생이다.",
  "꿈을 꿀 수 있다면 실현할 수도 있다. — Walt Disney",
  "천재는 1%의 영감과 99%의 땀으로 만들어진다. — Thomas Edison",
  "시작이 반이다. — Aristoteles",
  "지금 잠을 자면 꿈을 꾸지만, 지금 공부하면 꿈을 이룬다.",
  "오늘 하루의 노력이 1년 뒤의 나를 만든다.",
];

export default function StudentHome() {
  const [now, setNow] = useState(new Date());
  const [quote, setQuote] = useState("");
  const [todaySeconds] = useState(14400); // 예시 데이터

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const idx = Math.abs(
      new Date().toDateString().split("").reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0)
    ) % QUOTES.length;
    setQuote(QUOTES[idx]);
  }, []);

  const todayStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const shortcuts = [
    { href: "/student/timer", label: "학습 타이머", icon: Timer, desc: "공부 시작하기", color: "bg-brand-900 text-white" },
    { href: "/student/plan", label: "Daily Plan", icon: ClipboardList, desc: "오늘의 계획", color: "bg-white border border-brand-200" },
    { href: "/student/stats", label: "학습 통계", icon: BarChart2, desc: "나의 기록", color: "bg-white border border-brand-200" },
    { href: "/student/notices", label: "공지사항", icon: Bell, desc: "학원 공지", color: "bg-white border border-brand-200" },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* 날짜 & 인사 */}
      <div className="mb-8">
        <p className="text-sm text-brand-500 mb-1">{todayStr}</p>
        <h1 className="font-serif text-3xl font-bold text-brand-900">
          오늘도,{" "}
          <span className="italic text-brand-700">깊이 있는</span> 학습을.
        </h1>
        <p className="text-brand-500 text-sm mt-2 italic">"{quote}"</p>
      </div>

      {/* 오늘 학습 요약 */}
      <div className="bg-brand-900 rounded-2xl p-6 mb-6 text-white">
        <p className="text-brand-300 text-sm mb-2">오늘 누적 학습 시간</p>
        <p className="font-mono text-4xl font-bold mb-4">{formatTime(todaySeconds)}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-brand-300 text-xs">목표까지</p>
            <p className="font-mono text-lg font-semibold">{formatTime(Math.max(0, 21600 - todaySeconds))}</p>
          </div>
          <div className="text-right">
            <p className="text-brand-300 text-xs">목표 달성률</p>
            <p className="text-lg font-semibold">{Math.min(100, Math.round((todaySeconds / 21600) * 100))}%</p>
          </div>
        </div>
        {/* 진행 바 */}
        <div className="mt-4 h-2 bg-brand-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-status-study rounded-full transition-all"
            style={{ width: `${Math.min(100, (todaySeconds / 21600) * 100)}%` }}
          />
        </div>
        <p className="text-brand-400 text-xs mt-1">일일 목표: 6시간</p>
      </div>

      {/* 바로가기 */}
      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className={`rounded-2xl p-5 shadow-soft hover:-translate-y-0.5 transition-all group ${s.color}`}
            >
              <Icon className="w-6 h-6 mb-3 opacity-80" />
              <p className="font-semibold text-sm mb-0.5">{s.label}</p>
              <p className="text-xs opacity-60">{s.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
