"use client";

import { useState } from "react";
import { formatTime, getTodayStr } from "@/lib/utils";
import { FileText, Send, ChevronDown } from "lucide-react";

interface ReportRow {
  id: string;
  studentName: string;
  date: string;
  studySeconds: number;
  completedTasks: number;
  totalTasks: number;
  reflection: string;
  teacherComment: string;
  sent: boolean;
}

const MOCK_REPORTS: ReportRow[] = [
  { id: "1", studentName: "김민준", date: "2026-04-27", studySeconds: 14400, completedTasks: 4, totalTasks: 5, reflection: "수학 미적분 집중했습니다. 내일은 영어도 같이 해야겠어요.", teacherComment: "", sent: false },
  { id: "2", studentName: "이서연", date: "2026-04-27", studySeconds: 12600, completedTasks: 3, totalTasks: 4, reflection: "영어 독해 어려웠지만 끝까지 했습니다.", teacherComment: "", sent: false },
  { id: "3", studentName: "최수아", date: "2026-04-27", studySeconds: 18000, completedTasks: 5, totalTasks: 5, reflection: "오늘 계획 모두 완료! 뿌듯합니다.", teacherComment: "오늘도 훌륭했어요! 내일도 화이팅!", sent: true },
  { id: "4", studentName: "강하은", date: "2026-04-26", studySeconds: 21600, completedTasks: 6, totalTasks: 6, reflection: "6시간 공부 달성! 국어, 수학, 영어 모두 완료.", teacherComment: "정말 대단해요. 이 페이스 유지해요!", sent: true },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>(MOCK_REPORTS);
  const [selected, setSelected] = useState<ReportRow | null>(null);
  const [comment, setComment] = useState("");

  function handleSave(id: string) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, teacherComment: comment, sent: true } : r))
    );
    setSelected(null);
    setComment("");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-900">하원 보고서</h1>
        <p className="text-brand-500 text-sm mt-1">학생별 일일 학습 보고서 작성 및 발송</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* 보고서 목록 */}
        <div className="lg:col-span-2 space-y-3">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => { setSelected(r); setComment(r.teacherComment); }}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                selected?.id === r.id
                  ? "border-brand-500 bg-brand-50"
                  : "border-brand-100 bg-white hover:border-brand-300"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-brand-900">{r.studentName}</span>
                {r.sent ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">발송완료</span>
                ) : (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">미발송</span>
                )}
              </div>
              <p className="text-xs text-brand-500">{r.date}</p>
              <div className="flex gap-3 mt-2 text-xs text-brand-600">
                <span>학습 {formatTime(r.studySeconds)}</span>
                <span>달성 {r.completedTasks}/{r.totalTasks}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 보고서 상세 */}
        {selected ? (
          <div className="lg:col-span-3 bg-white rounded-2xl border border-brand-100 shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-brand-900">{selected.studentName}</h2>
                <p className="text-sm text-brand-500">{selected.date} 일일 보고서</p>
              </div>
              <FileText className="w-6 h-6 text-brand-300" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-xs text-brand-500 mb-1">학습 시간</p>
                <p className="font-mono font-bold text-brand-900 text-sm">{formatTime(selected.studySeconds)}</p>
              </div>
              <div className="bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-xs text-brand-500 mb-1">과제 달성</p>
                <p className="font-bold text-brand-900 text-sm">{selected.completedTasks}/{selected.totalTasks}</p>
              </div>
              <div className="bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-xs text-brand-500 mb-1">달성률</p>
                <p className="font-bold text-brand-900 text-sm">
                  {selected.totalTasks ? Math.round((selected.completedTasks / selected.totalTasks) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-2">학생 회고</p>
              <div className="bg-brand-50 rounded-xl p-4 text-sm text-brand-800 leading-relaxed">
                {selected.reflection || "회고 없음"}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-2">선생님 코멘트</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="학부모에게 전달할 코멘트를 작성하세요..."
                rows={4}
                className="w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <button
              onClick={() => handleSave(selected.id)}
              className="flex w-full items-center justify-center gap-2 bg-brand-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors"
            >
              <Send className="w-4 h-4" />
              보고서 저장 및 발송
            </button>
          </div>
        ) : (
          <div className="lg:col-span-3 bg-white rounded-2xl border border-dashed border-brand-200 flex items-center justify-center text-brand-300 text-sm">
            보고서를 선택하세요
          </div>
        )}
      </div>
    </div>
  );
}
