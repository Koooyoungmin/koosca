"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTime } from "@/lib/utils";
import { Clock, CheckCircle, BookOpen, TrendingUp } from "lucide-react";

const CHILD = {
  name: "김민준",
  grade: "고2",
  seat: 1,
  status: "study" as const,
  todaySeconds: 14400,
  weekSeconds: 86400,
  completedTasks: 4,
  totalTasks: 5,
  lastActivity: "수학 미적분 학습 중",
};

export default function ParentHome() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const todayStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const progress = CHILD.totalTasks
    ? Math.round((CHILD.completedTasks / CHILD.totalTasks) * 100)
    : 0;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-brand-500 mb-1">{todayStr}</p>
        <h1 className="font-serif text-3xl font-bold text-brand-900">자녀 학습 현황</h1>
      </div>

      {/* 자녀 상태 카드 */}
      <div className="bg-brand-900 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-brand-300 text-sm mb-1">{CHILD.grade} · {CHILD.seat}번 좌석</p>
            <h2 className="font-serif text-2xl font-bold">{CHILD.name}</h2>
          </div>
          <StatusBadge status={CHILD.status} className="bg-white/10 border-white/20 text-white" />
        </div>

        <p className="text-brand-300 text-xs mb-1">현재 활동</p>
        <p className="text-sm mb-4">{CHILD.lastActivity}</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-brand-300 text-xs mb-1">오늘 학습</p>
            <p className="font-mono text-xl font-bold">{formatTime(CHILD.todaySeconds)}</p>
          </div>
          <div>
            <p className="text-brand-300 text-xs mb-1">현재 시각</p>
            <p className="font-mono text-xl font-bold">{now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
      </div>

      {/* 오늘 달성률 */}
      <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-status-study" />
            <p className="font-medium text-brand-800">오늘의 계획 달성률</p>
          </div>
          <p className="text-2xl font-bold text-brand-900">{progress}%</p>
        </div>
        <div className="h-3 bg-brand-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-status-study rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-brand-400 mt-2">{CHILD.completedTasks} / {CHILD.totalTasks} 과제 완료</p>
      </div>

      {/* 주간 학습 */}
      <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-brand-400" />
          <p className="font-medium text-brand-800">이번 주 누적 학습</p>
        </div>
        <p className="font-mono text-2xl font-bold text-brand-900">{formatTime(CHILD.weekSeconds)}</p>
        <p className="text-xs text-brand-400 mt-1">일 평균 {formatTime(Math.round(CHILD.weekSeconds / 7))}</p>
      </div>

      {/* 빠른 링크 */}
      <div className="grid grid-cols-2 gap-3">
        <a href="/parent/reports" className="bg-white rounded-2xl border border-brand-100 shadow-soft p-4 hover:border-brand-300 transition-all">
          <BookOpen className="w-5 h-5 text-brand-400 mb-2" />
          <p className="text-sm font-medium text-brand-800">학습 보고서</p>
          <p className="text-xs text-brand-400 mt-0.5">일일 보고서 확인</p>
        </a>
        <a href="/parent/caretalk" className="bg-white rounded-2xl border border-brand-100 shadow-soft p-4 hover:border-brand-300 transition-all">
          <Clock className="w-5 h-5 text-brand-400 mb-2" />
          <p className="text-sm font-medium text-brand-800">케어톡</p>
          <p className="text-xs text-brand-400 mt-0.5">선생님과 소통</p>
        </a>
      </div>
    </div>
  );
}
