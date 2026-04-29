"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTime, getTodayStr } from "@/lib/utils";
import { Users, Clock, CheckCircle, TrendingUp } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface StudentStatus {
  id: string;
  user_id: string;
  date: string;
  status: "study" | "outing" | "sleep" | "away";
  daily_minutes: number;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface StudentRow {
  profile: StudentProfile;
  status: StudentStatus | null;
  today_minutes: number;
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadStudents();
    subscribeToUpdates();
  }, []);

  async function loadStudents() {
    try {
      // 모든 학생 프로필 불러오기
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;

      // 각 학생의 오늘 상태 불러오기
      const today = getTodayStr();
      const { data: statuses, error: statusError } = await supabase
        .from("student_status")
        .select("*")
        .eq("date", today);

      if (statusError) throw statusError;

      // 학생 데이터 결합
      const statusMap = new Map(statuses?.map((s) => [s.user_id, s]) || []);

      const studentRows: StudentRow[] = (profiles || []).map((profile) => ({
        profile,
        status: statusMap.get(profile.id) || null,
        today_minutes: statusMap.get(profile.id)?.daily_minutes || 0,
      }));

      setStudents(studentRows);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToUpdates() {
    const channel = supabase
      .channel("student_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "student_status",
        },
        (payload) => {
          loadStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  async function updateStatus(studentId: string, newStatus: "study" | "outing" | "sleep" | "away") {
    try {
      const today = getTodayStr();
      const { error } = await supabase
        .from("student_status")
        .update({ status: newStatus })
        .eq("user_id", studentId)
        .eq("date", today);

      if (error) throw error;
      loadStudents();
    } catch (err: any) {
      setError(err.message);
    }
  }

  const studying = students.filter((s) => s.status?.status === "study").length;
  const outing = students.filter((s) => s.status?.status === "outing").length;
  const away = students.filter((s) => s.status?.status === "away").length;
  const avgStudy = students.length
    ? Math.round(students.reduce((a, s) => a + s.today_minutes, 0) / students.length)
    : 0;

  const todayStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-brand-50">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-brand-600">로딩 중...</p>
          </div>
          <BottomNav />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-6">
          <div className="max-w-6xl mx-auto">
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

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

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
                value={formatTime(avgStudy * 60)}
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
                <h2 className="font-serif text-lg font-semibold text-brand-900">
                  실시간 학생 현황
                </h2>
                <span className="flex items-center gap-1.5 text-xs text-status-study">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-study animate-pulse" />
                  실시간 업데이트
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-brand-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">
                        이름
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">
                        이메일
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">
                        오늘 학습
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-50">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-brand-400 text-sm">
                          등록된 학생이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr
                          key={student.profile.id}
                          className="hover:bg-brand-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-brand-900">
                            {student.profile.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-brand-600">
                            {student.profile.email}
                          </td>
                          <td className="px-6 py-4">
                            {student.status ? (
                              <StatusBadge status={student.status.status} />
                            ) : (
                              <span className="text-xs text-brand-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-brand-700">
                            {formatTime(student.today_minutes * 60)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {(["study", "outing", "sleep", "away"] as const).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(student.profile.id, s)}
                                  className={`px-2 py-1 rounded text-xs transition-all ${
                                    student.status?.status === s
                                      ? "bg-brand-900 text-white"
                                      : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                                  }`}
                                >
                                  {s === "study"
                                    ? "학습"
                                    : s === "outing"
                                    ? "외출"
                                    : s === "sleep"
                                    ? "수면"
                                    : "하원"}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </main>
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
        highlight ? "bg-brand-900 border-brand-800 text-white" : "bg-white border-brand-100"
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
