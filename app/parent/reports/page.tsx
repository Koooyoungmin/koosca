"use client";

import { useState } from "react";
import { formatTime } from "@/lib/utils";
import { FileText, ChevronRight } from "lucide-react";

const REPORTS = [
  { id: "1", date: "2026-04-27", studySeconds: 14400, completedTasks: 4, totalTasks: 5, reflection: "수학 미적분 집중했습니다. 내일은 영어도 같이 해야겠어요.", teacherComment: "오늘도 열심히 했어요! 내일도 화이팅!" },
  { id: "2", date: "2026-04-26", studySeconds: 18000, completedTasks: 5, totalTasks: 5, reflection: "오늘 계획 모두 완료! 뿌듯합니다.", teacherComment: "100% 달성! 정말 훌륭합니다. 이 페이스 유지해요." },
  { id: "3", date: "2026-04-25", studySeconds: 12600, completedTasks: 3, totalTasks: 4, reflection: "영어 독해가 어려웠지만 끝까지 했습니다.", teacherComment: "영어 독해 꾸준히 하면 반드시 늘어요. 잘하고 있어요!" },
  { id: "4", date: "2026-04-24", studySeconds: 21600, completedTasks: 6, totalTasks: 6, reflection: "6시간 공부 달성! 국어, 수학, 영어 모두 완료.", teacherComment: "최고 기록 달성! 대단해요." },
];

export default function ParentReportsPage() {
  const [selected, setSelected] = useState<(typeof REPORTS)[0] | null>(REPORTS[0]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-900">학습 보고서</h1>
        <p className="text-brand-500 text-sm mt-1">자녀의 일일 학습 보고서를 확인하세요</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* 보고서 목록 */}
        <div className="lg:col-span-2 space-y-3">
          {REPORTS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                selected?.id === r.id
                  ? "border-brand-500 bg-brand-50"
                  : "border-brand-100 bg-white hover:border-brand-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-brand-900">{r.date}</span>
                <ChevronRight className="w-4 h-4 text-brand-300" />
              </div>
              <div className="flex gap-3 text-xs text-brand-500">
                <span>학습 {formatTime(r.studySeconds)}</span>
                <span>달성 {r.completedTasks}/{r.totalTasks}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 보고서 상세 */}
        {selected && (
          <div className="lg:col-span-3 bg-white rounded-2xl border border-brand-100 shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-brand-900">일일 학습 보고서</h2>
                <p className="text-sm text-brand-500">{selected.date}</p>
              </div>
              <FileText className="w-6 h-6 text-brand-300" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-xs text-brand-500 mb-1">학습 시간</p>
                <p className="font-mono font-bold text-brand-900">{formatTime(selected.studySeconds)}</p>
              </div>
              <div className="bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-xs text-brand-500 mb-1">과제 달성</p>
                <p className="font-bold text-brand-900">{selected.completedTasks}/{selected.totalTasks}</p>
              </div>
              <div className="bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-xs text-brand-500 mb-1">달성률</p>
                <p className="font-bold text-brand-900">
                  {Math.round((selected.completedTasks / selected.totalTasks) * 100)}%
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-2">자녀 회고</p>
              <div className="bg-brand-50 rounded-xl p-4 text-sm text-brand-800 leading-relaxed">
                {selected.reflection}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-2">선생님 코멘트</p>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800 leading-relaxed">
                {selected.teacherComment || "아직 코멘트가 없습니다."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
