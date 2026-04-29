"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTime, getTodayStr } from "@/lib/utils";
import { Users, Clock, CheckCircle, TrendingUp, Search, Plus } from "lucide-react";
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
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;

      const today = getTodayStr();
      const { data: statuses, error: statusError } = await supabase
        .from("student_status")
        .select("*")
        .eq("date", today);

      if (statusError) throw statusError;

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
        () => {
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
        <Sidebar role="admin" userName="관리자" />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-brand-600 font-medium">로딩 중...</p>
          </div>
          <BottomNav />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar role="admin" userName="구영민 선생님" />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <h1 className="font-serif text-3xl font-bold text-brand-900">관리자 대시보드</h1>
                <div className="flex items-center gap-2 text-brand-400 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  {now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
              </div>
              <p className="text-brand-500 font-medium">{todayStr}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* 요약 카드 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <SummaryCard
                icon={<Users className="w-5 h-5 text-brand-500" />}
                label="전체 학생"
                value={`${students.length}명`}
                sub="등록 학생"
              />
              <SummaryCard
                icon={<div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />}
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
            <div className="bg-white rounded-[32px] border border-brand-100 shadow-soft overflow-hidden">
              <div className="px-8 py-6 border-b border-brand-100 flex items-center justify-between bg-white">
                <div>
                  <h2 className="font-serif text-xl font-bold text-brand-900">
                    실시간 학생 현황
                  </h2>
                  <p className="text-xs text-brand-400 mt-1 font-medium">좌석별 학습 상태 및 누적 시간</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative hidden sm:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
                    <input 
                      type="text" 
                      placeholder="학생 검색..." 
                      className="pl-9 pr-4 py-2 bg-brand-50 border-none rounded-xl text-xs font-medium text-brand-900 placeholder:text-brand-300 focus:ring-2 focus:ring-brand-200 w-48 transition-all"
                    />
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-brand-500 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                    Live
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-brand-50/50">
                      <th className="text-left px-8 py-4 text-[11px] font-bold text-brand-400 uppercase tracking-widest">
                        이름
                      </th>
                      <th className="text-left px-8 py-4 text-[11px] font-bold text-brand-400 uppercase tracking-widest">
                        상태
                      </th>
                      <th className="text-left px-8 py-4 text-[11px] font-bold text-brand-400 uppercase tracking-widest">
                        오늘 학습
                      </th>
                      <th className="text-left px-8 py-4 text-[11px] font-bold text-brand-400 uppercase tracking-widest">
                        상태 관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-50">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-brand-300 text-sm font-medium">
                          등록된 학생이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr
                          key={student.profile.id}
                          className="hover:bg-brand-50/30 transition-colors group"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
                                {student.profile.name[0]}
                              </div>
                              <div>
                                <p className="font-bold text-brand-900 text-sm">{student.profile.name}</p>
                                <p className="text-[11px] text-brand-400 font-medium">{student.profile.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            {student.status ? (
                              <StatusBadge status={student.status.status} />
                            ) : (
                              <span className="text-xs text-brand-300 font-medium">미등록</span>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            <span className="font-mono font-bold text-brand-700 text-sm">
                              {formatTime(student.today_minutes * 60)}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex gap-1.5">
                              {(["study", "outing", "sleep", "away"] as const).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(student.profile.id, s)}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                    student.status?.status === s
                                      ? "bg-brand-700 text-white shadow-md"
                                      : "bg-brand-50 text-brand-500 hover:bg-brand-100 hover:text-brand-700"
                                  }`}
                                >
                                  {s === "study" ? "학습" : s === "outing" ? "외출" : s === "sleep" ? "수면" : "하원"}
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
      className={`rounded-[28px] p-6 border transition-all hover:shadow-lg ${
        highlight 
          ? "bg-brand-700 border-brand-600 text-white shadow-brand-200/50 shadow-xl" 
          : "bg-white border-brand-100 text-brand-900 shadow-soft"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? "text-brand-200" : "text-brand-400"}`}>
          {label}
        </span>
        <div className={highlight ? "text-white" : "text-brand-500"}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold font-serif mb-1">
        {value}
      </p>
      <p className={`text-[11px] font-semibold ${highlight ? "text-brand-200/80" : "text-brand-400"}`}>
        {sub}
      </p>
    </div>
  );
}
