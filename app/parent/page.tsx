"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTime, getTodayStr } from "@/lib/utils";
import { Clock, CheckCircle, BookOpen, TrendingUp, MessageCircle, FileText } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface StudentData {
  profile: {
    id: string;
    name: string;
    email: string;
  };
  status: {
    status: "study" | "outing" | "sleep" | "away";
  } | null;
  stats: {
    daily_minutes: number;
    weekly_minutes: number;
  } | null;
  plan: {
    tasks: Array<{ completed: boolean }>;
  } | null;
}

export default function ParentHome() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadStudentData();
    subscribeToUpdates();
  }, []);

  async function loadStudentData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { data: students, error: studentError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .limit(1)
        .single();

      if (studentError && studentError.code !== "PGRST116") throw studentError;

      if (!students) {
        setStudent(null);
        setLoading(false);
        return;
      }

      const today = getTodayStr();
      const { data: statusData } = await supabase
        .from("student_status")
        .select("*")
        .eq("user_id", students.id)
        .eq("date", today)
        .single();

      const { data: statsData } = await supabase
        .from("study_stats")
        .select("*")
        .eq("user_id", students.id)
        .eq("date", today)
        .single();

      const { data: planData } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("user_id", students.id)
        .eq("date", today)
        .single();

      setStudent({
        profile: students,
        status: statusData || null,
        stats: statsData || null,
        plan: planData || null,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToUpdates() {
    const channels = [
      supabase
        .channel("student_status_updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "student_status",
          },
          () => loadStudentData()
        )
        .subscribe(),
      supabase
        .channel("study_stats_updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "study_stats",
          },
          () => loadStudentData()
        )
        .subscribe(),
    ];

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }

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

  const completedTasks = student?.plan?.tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = student?.plan?.tasks?.length || 0;
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-brand-50">
        <Sidebar role="parent" userName="학부모" />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-brand-600 font-medium">로딩 중...</p>
          </div>
          <BottomNav role="parent" />
        </main>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen bg-brand-50">
        <Sidebar role="parent" userName="학부모" />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white p-10 rounded-[32px] border border-brand-100 shadow-soft">
              <p className="text-brand-600 font-bold mb-2">등록된 자녀 정보가 없습니다.</p>
              <p className="text-sm text-brand-400 font-medium">관리자에게 문의해주세요.</p>
            </div>
          </div>
          <BottomNav role="parent" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar role="parent" userName="학부모" />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-8">
          <div className="max-w-2xl mx-auto">
            {/* 헤더 */}
            <div className="mb-10">
              <p className="text-sm font-semibold text-brand-400 mb-2 uppercase tracking-widest">{todayStr}</p>
              <h1 className="font-serif text-4xl font-bold text-brand-900 leading-tight">자녀 학습 현황</h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* 자녀 상태 카드 */}
            <div className="bg-brand-900 rounded-[32px] p-8 mb-8 text-white shadow-soft relative overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-800/50 blur-2xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-1">고2 · 1번 좌석</p>
                    <h2 className="font-serif text-3xl font-bold">{student.profile.name}</h2>
                  </div>
                  {student.status && (
                    <StatusBadge
                      status={student.status.status}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-1">오늘 학습</p>
                    <p className="font-mono text-3xl font-bold text-brand-100">
                      {formatTime((student.stats?.daily_minutes || 0) * 60)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-1">현재 시각</p>
                    <p className="font-mono text-3xl font-bold text-brand-100">
                      {now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-brand-800/50">
                  <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-1">현재 활동</p>
                  <p className="text-sm font-bold text-brand-100">
                    {student.status?.status === "study"
                      ? "수학 미적분 학습 중"
                      : student.status?.status === "outing"
                      ? "외출 중"
                      : student.status?.status === "sleep"
                      ? "수면 중"
                      : "하원"}
                  </p>
                </div>
              </div>
            </div>

            {/* 오늘 달성률 */}
            <div className="bg-white rounded-[28px] border border-brand-100 shadow-soft p-7 mb-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-900 text-sm">오늘의 계획 달성률</p>
                    <p className="text-[11px] text-brand-400 font-medium">{completedTasks} / {totalTasks} 과제 완료</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-brand-900">{progress}%</p>
              </div>
              <div className="h-2.5 bg-brand-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 주간 학습 */}
            <div className="bg-white rounded-[28px] border border-brand-100 shadow-soft p-7 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <p className="font-bold text-brand-900 text-sm">이번 주 누적 학습</p>
                  <p className="text-[11px] text-brand-400 font-medium">일 평균 {formatTime(Math.round(((student.stats?.weekly_minutes || 0) / 7) * 60))}</p>
                </div>
              </div>
              <p className="font-mono text-3xl font-bold text-brand-900">
                {formatTime((student.stats?.weekly_minutes || 0) * 60)}
              </p>
            </div>

            {/* 빠른 링크 */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/parent/reports"
                className="group bg-white rounded-[28px] border border-brand-100 shadow-soft p-6 hover:border-brand-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-brand-600" />
                </div>
                <p className="text-sm font-bold text-brand-900">학습 보고서</p>
                <p className="text-[11px] text-brand-400 mt-1 font-medium">일일 보고서 확인</p>
              </a>
              <a
                href="/parent/caretalk"
                className="group bg-white rounded-[28px] border border-brand-100 shadow-soft p-6 hover:border-brand-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-brand-600" />
                </div>
                <p className="text-sm font-bold text-brand-900">케어톡</p>
                <p className="text-[11px] text-brand-400 mt-1 font-medium">선생님과 소통</p>
              </a>
            </div>
          </div>
        </div>
        <BottomNav role="parent" />
      </main>
    </div>
  );
}
