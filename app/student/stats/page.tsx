"use client";

import { formatTime } from "@/lib/utils";
import { BarChart2, TrendingUp, Calendar, Award } from "lucide-react";

const WEEKLY_DATA = [
  { day: "월", seconds: 18000, label: "5h" },
  { day: "화", seconds: 21600, label: "6h" },
  { day: "수", seconds: 14400, label: "4h" },
  { day: "목", seconds: 25200, label: "7h" },
  { day: "금", seconds: 19800, label: "5.5h" },
  { day: "토", seconds: 28800, label: "8h" },
  { day: "일", seconds: 10800, label: "3h" },
];

const MONTHLY_DATA = [
  { week: "1주", seconds: 108000 },
  { week: "2주", seconds: 126000 },
  { week: "3주", seconds: 118800 },
  { week: "4주", seconds: 138600 },
];

const MAX_WEEKLY = Math.max(...WEEKLY_DATA.map((d) => d.seconds));
const MAX_MONTHLY = Math.max(...MONTHLY_DATA.map((d) => d.seconds));

export default function StatsPage() {
  const totalWeek = WEEKLY_DATA.reduce((a, d) => a + d.seconds, 0);
  const avgDay = Math.round(totalWeek / 7);
  const bestDay = WEEKLY_DATA.reduce((a, b) => (a.seconds > b.seconds ? a : b));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-900">학습 통계</h1>
        <p className="text-brand-500 text-sm mt-1">나의 학습 기록을 한눈에</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-brand-900 rounded-2xl p-5 text-white">
          <TrendingUp className="w-5 h-5 mb-3 text-brand-300" />
          <p className="text-xs text-brand-300 mb-1">이번 주 총 학습</p>
          <p className="font-bold text-xl font-mono">{formatTime(totalWeek)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5">
          <Calendar className="w-5 h-5 mb-3 text-brand-400" />
          <p className="text-xs text-brand-500 mb-1">일 평균 학습</p>
          <p className="font-bold text-xl font-mono text-brand-900">{formatTime(avgDay)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5">
          <Award className="w-5 h-5 mb-3 text-yellow-500" />
          <p className="text-xs text-brand-500 mb-1">최고 기록</p>
          <p className="font-bold text-xl font-mono text-brand-900">{formatTime(bestDay.seconds)}</p>
          <p className="text-xs text-brand-400 mt-1">{bestDay.day}요일</p>
        </div>
        <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5">
          <BarChart2 className="w-5 h-5 mb-3 text-brand-400" />
          <p className="text-xs text-brand-500 mb-1">목표 달성일</p>
          <p className="font-bold text-xl text-brand-900">
            {WEEKLY_DATA.filter((d) => d.seconds >= 21600).length}일
          </p>
          <p className="text-xs text-brand-400 mt-1">6시간 이상</p>
        </div>
      </div>

      {/* 주간 바 차트 */}
      <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-6 mb-6">
        <h2 className="font-serif text-lg font-semibold text-brand-900 mb-6">이번 주 학습 현황</h2>
        <div className="flex items-end gap-3 h-40">
          {WEEKLY_DATA.map((d, i) => {
            const today = new Date().getDay();
            const dayIdx = i === 6 ? 0 : i + 1;
            const isToday = dayIdx === today;
            const pct = (d.seconds / MAX_WEEKLY) * 100;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-brand-500 font-mono">{d.label}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isToday ? "bg-brand-900" : d.seconds >= 21600 ? "bg-status-study" : "bg-brand-200"
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${isToday ? "text-brand-900" : "text-brand-400"}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-brand-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-900 inline-block" /> 오늘</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-status-study inline-block" /> 목표 달성</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-200 inline-block" /> 미달성</span>
        </div>
      </div>

      {/* 월간 차트 */}
      <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-6">
        <h2 className="font-serif text-lg font-semibold text-brand-900 mb-6">이번 달 주간 학습</h2>
        <div className="space-y-3">
          {MONTHLY_DATA.map((d) => (
            <div key={d.week} className="flex items-center gap-3">
              <span className="text-xs text-brand-500 w-8">{d.week}</span>
              <div className="flex-1 h-6 bg-brand-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-700 rounded-full transition-all"
                  style={{ width: `${(d.seconds / MAX_MONTHLY) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-brand-600 w-16 text-right">{formatTime(d.seconds)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
