"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTime, getTodayStr } from "@/lib/utils";
import { Users, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface StudentRow {
  id: string;
  name: string;
  seat_number: number | null;
  status: "study" | "outing" | "sleep" | "away";
  today_seconds: number;
}

const MOCK_STUDENTS: StudentRow[] = [
  { id: "1", name: "김민준", seat_number: 1, status: "study", today_seconds: 14400 },
  { id: "2", name: "이서연", seat_number: 2, status: "study", today_seconds: 12600 },
  { id: "3", name: "박지호", seat_number: 3, status: "outing", today_seconds: 9000 },
  { id: "4", name: "최수아", seat_number: 4, status: "study", today_seconds: 18000 },
  { id: "5", name: "정도윤", seat_number: 5, status: "sleep", today_seconds: 7200 },
  { id: "6", name: "강하은", seat_number: 6, status: "study", today_seconds: 21600 },
  { id: "7", name: "윤시우", seat_number: 7, status: "away", today_seconds: 10800 },
  { id: "8", name: "임나연", seat_number: 8, status: "study", today_seconds: 16200 },
];

export default function AdminDashboard() {
  const [students, setStudents] = useState<StudentRow[]>(MOCK_STUDENTS);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const studying = students.filter((s) => s.status === "study").length;
  const outing = students.filter((s) => s.status === "outing").length;
  const away = students.filter((s) => s.status === "away").length;
  const avgStudy = students.length
    ? Math.round(students.reduce((a, s) => a + s.today_seconds, 0) / students.length)
    : 0;

  const todayStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-sm text-brand-500 mb-1">{todayStr}</p>
        <h1 className="font-serif text-3xl font-bold text-brand-900">관리자 대시보드</h1>
        <p className="text-brand-600 mt-1 text-sm">
          현재 시각:{" "}
          <span className="font-mono font-semibold text-brand-800">
            {now.toLocaleTimeString("ko-KR")}
          </span>
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          icon={<Users className="w-5 h-5 text-brand-500" />}
          label="전체 학생"
          value={`${students.length}명`}
          sub="등록 학생"
        />
        <SummaryCard
          icon={<span className="w-5 h-5 rounded-full bg-status-study inline-block" />}
          label="학습 중"
          value={`${studying}명`}
          sub={`외출 ${outing}명`}
          highlight
        />
        <SummaryCard
          icon={<Clock className="w-5 h-5 text-brand-500" />}
          label="평균 학습"
          value={formatTime(avgStudy)}
          sub="오늘 평균"
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5 text-brand-500" />}
          label="하원"
          value={`${away}명`}
          sub="오늘 하원"
        />
      </div>

      {/* 실시간 학생 현황 */}
      <div className="bg-white rounded-2xl border border-brand-100 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-100 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-brand-900">실시간 학생 현황</h2>
          <span className="flex items-center gap-1.5 text-xs text-status-study">
            <span className="h-1.5 w-1.5 rounded-full bg-status-study animate-pulse" />
            실시간 업데이트
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">좌석</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">이름</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">상태</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">오늘 학습</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-brand-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-brand-600">
                    {student.seat_number ?? "-"}번
                  </td>
                  <td className="px-6 py-4 font-medium text-brand-900">{student.name}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-brand-700">
                    {formatTime(student.today_seconds)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {(["study", "outing", "sleep", "away"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() =>
                            setStudents((prev) =>
                              prev.map((st) =>
                                st.id === student.id ? { ...st, status: s } : st
                              )
                            )
                          }
                          className={`px-2 py-1 rounded text-xs transition-all ${
                            student.status === s
                              ? "bg-brand-900 text-white"
                              : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                          }`}
                        >
                          {s === "study" ? "학습" : s === "outing" ? "외출" : s === "sleep" ? "수면" : "하원"}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border shadow-soft ${
        highlight
          ? "bg-brand-900 border-brand-800 text-white"
          : "bg-white border-brand-100"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium opacity-70">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold font-serif ${highlight ? "text-white" : "text-brand-900"}`}>
        {value}
      </p>
      <p className={`text-xs mt-1 ${highlight ? "text-brand-200" : "text-brand-400"}`}>{sub}</p>
    </div>
  );
}
