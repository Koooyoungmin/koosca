"use client";

import { formatTime } from "@/lib/utils";

const WEEKLY = [
  { day: "월", seconds: 18000 },
  { day: "화", seconds: 21600 },
  { day: "수", seconds: 14400 },
  { day: "목", seconds: 25200 },
  { day: "금", seconds: 19800 },
  { day: "토", seconds: 28800 },
  { day: "일", seconds: 10800 },
];

const MAX = Math.max(...WEEKLY.map((d) => d.seconds));

export default function ParentStatsPage() {
  const total = WEEKLY.reduce((a, d) => a + d.seconds, 0);
  const avg = Math.round(total / 7);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-900">학습 통계</h1>
        <p className="text-brand-500 text-sm mt-1">자녀의 주간 학습 현황</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-brand-900 rounded-2xl p-5 text-white">
          <p className="text-xs text-brand-300 mb-1">이번 주 총 학습</p>
          <p className="font-bold text-xl font-mono">{formatTime(total)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5">
          <p className="text-xs text-brand-500 mb-1">일 평균 학습</p>
          <p className="font-bold text-xl font-mono text-brand-900">{formatTime(avg)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-6">
        <h2 className="font-serif text-lg font-semibold text-brand-900 mb-6">이번 주 학습 현황</h2>
        <div className="flex items-end gap-3 h-40">
          {WEEKLY.map((d) => {
            const pct = (d.seconds / MAX) * 100;
            const goal = d.seconds >= 21600;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-brand-400 font-mono">{formatTime(d.seconds).slice(0, 4)}h</span>
                <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                  <div
                    className={`w-full rounded-t-lg ${goal ? "bg-status-study" : "bg-brand-200"}`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-brand-500">{d.day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-brand-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-status-study inline-block" /> 목표 달성 (6h+)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-200 inline-block" /> 미달성</span>
        </div>
      </div>
    </div>
  );
}
