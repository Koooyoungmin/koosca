"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import { Timer, ClipboardList, BarChart2, Bell, ArrowRight, Clock } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

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
    { href: "/student/timer", label: "학습 타이머", icon: Timer, desc: "공부 시작하기", color: "bg-brand-900 text-white shadow-brand-200/50 shadow-xl" },
    { href: "/student/plan", label: "Daily Plan", icon: ClipboardList, desc: "오늘의 계획", color: "bg-white border border-brand-100 text-brand-900" },
    { href: "/student/stats", label: "학습 통계", icon: BarChart2, desc: "나의 기록", color: "bg-white border border-brand-100 text-brand-900" },
    { href: "/student/notices", label: "공지사항", icon: Bell, desc: "학원 공지", color: "bg-white border border-brand-100 text-brand-900" },
  ];

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar role="student" userName="학생" />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-8">
          <div className="max-w-2xl mx-auto">
            {/* 날짜 & 인사 */}
            <div className="mb-10">
              <p className="text-sm font-semibold text-brand-400 mb-2 uppercase tracking-widest">{todayStr}</p>
              <h1 className="font-serif text-4xl font-bold text-brand-900 leading-tight">
                오늘도, <br />
                <span className="text-brand-600 italic">깊이 있는</span> 학습을.
              </h1>
              <p className="text-brand-500 text-sm mt-4 font-medium italic opacity-80">"{quote}"</p>
            </div>

            {/* 오늘 학습 요약 */}
            <div className="bg-brand-900 rounded-[32px] p-8 mb-8 text-white shadow-soft relative overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-800/50 blur-2xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-brand-300 text-[11px] font-bold uppercase tracking-widest">오늘 누적 학습 시간</p>
                  <Clock className="w-4 h-4 text-brand-400" />
                </div>
                <p className="font-mono text-5xl font-bold mb-8 tracking-tight">{formatTime(todaySeconds)}</p>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-1">목표까지</p>
                    <p className="font-mono text-xl font-bold text-brand-100">{formatTime(Math.max(0, 21600 - todaySeconds))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-1">목표 달성률</p>
                    <p className="text-xl font-bold text-brand-100">{Math.min(100, Math.round((todaySeconds / 21600) * 100))}%</p>
                  </div>
                </div>
                
                {/* 진행 바 */}
                <div className="h-2.5 bg-brand-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-brand-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(96,165,250,0.5)]"
                    style={{ width: `${Math.min(100, (todaySeconds / 21600) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest">일일 목표: 6시간</p>
                  <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest">67%</p>
                </div>
              </div>
            </div>

            {/* 바로가기 */}
            <div className="grid grid-cols-2 gap-4">
              {shortcuts.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    className={`rounded-[28px] p-6 shadow-soft hover:-translate-y-1.5 transition-all duration-300 group ${s.color}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${s.href === '/student/timer' ? 'bg-brand-800' : 'bg-brand-50'}`}>
                      <Icon className={`w-6 h-6 ${s.href === '/student/timer' ? 'text-brand-300' : 'text-brand-600'}`} />
                    </div>
                    <p className="font-bold text-sm mb-1">{s.label}</p>
                    <p className={`text-[11px] font-medium ${s.href === '/student/timer' ? 'text-brand-400' : 'text-brand-400'}`}>{s.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
