"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTime, getTodayStr } from "@/lib/utils";
import { Clock, CheckCircle, BookOpen, TrendingUp } from "lucide-react";
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

      // 학부모 프로필 가져오기
      const { data: parentProfile, error: parentError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (parentError) throw parentError;

      // 자녀 정보 가져오기 (학부모-학생 관계 테이블 필요)
      // 현재는 첫 번째 학생으로 설정 (실제로는 관계 테이블 필요)
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

      // 오늘 상태 가져오기
      const today = getTodayStr();
      const { data: statusData } = await supabase
        .from("student_status")
        .select("*")
        .eq("user_id", students.id)
        .eq("date", today)
        .single();

      // 오늘 통계 가져오기
      const { data: statsData } = await supabase
        .from("study_stats")
        .select("*")
        .eq("user_id", students.id)
        .eq("date", today)
        .single();

      // 오늘 계획 가져오기
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

  if (!student) {
    return (
      <div className="flex min-h-screen bg-brand-50">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-brand-600 mb-2">등록된 자녀 정보가 없습니다.</p>
              <p className="text-sm text-brand-400">관리자에게 문의해주세요.</p>
            </div>
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <p className="text-sm text-brand-500 mb-1">{todayStr}</p>
              <h1 className="font-serif text-3xl font-bold text-brand-900">자녀 학습 현황</h1>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* 자녀 상태 카드 */}
            <div className="bg-brand-900 rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-brand-300 text-sm mb-1">{student.profile.email}</p>
                  <h2 className="font-serif text-2xl font-bold">{student.profile.name}</h2>
                </div>
                {student.status && (
                  <StatusBadge
                    status={student.status.status}
                    className="bg-white/10 border-white/20 text-white"
                  />
                )}
              </div>

              <p className="text-brand-300 text-xs mb-1">현재 활동</p>
              <p className="text-sm mb-4">
                {student.status?.status === "study"
                  ? "학습 중"
                  : student.status?.status === "outing"
                  ? "외출 중"
                  : student.status?.status === "sleep"
                  ? "수면 중"
                  : "하원"}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-brand-300 text-xs mb-1">오늘 학습</p>
                  <p className="font-mono text-xl font-bold">
                    {formatTime((student.stats?.daily_minutes || 0) * 60)}
                  </p>
                </div>
                <div>
                  <p className="text-brand-300 text-xs mb-1">현재 시각</p>
                  <p className="font-mono text-xl font-bold">
                    {now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
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
              <p className="text-xs text-brand-400 mt-2">
                {completedTasks} / {totalTasks} 과제 완료
              </p>
            </div>

            {/* 주간 학습 */}
            <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-brand-400" />
                <p className="font-medium text-brand-800">이번 주 누적 학습</p>
              </div>
              <p className="font-mono text-2xl font-bold text-brand-900">
                {formatTime((student.stats?.weekly_minutes || 0) * 60)}
              </p>
              <p className="text-xs text-brand-400 mt-1">
                일 평균{" "}
                {formatTime(Math.round(((student.stats?.weekly_minutes || 0) / 7) * 60))}
              </p>
            </div>

            {/* 빠른 링크 */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/parent/reports"
                className="bg-white rounded-2xl border border-brand-100 shadow-soft p-4 hover:border-brand-300 transition-all"
              >
                <BookOpen className="w-5 h-5 text-brand-400 mb-2" />
                <p className="text-sm font-medium text-brand-800">학습 보고서</p>
                <p className="text-xs text-brand-400 mt-0.5">일일 보고서 확인</p>
              </a>
              <a
                href="/parent/caretalk"
                className="bg-white rounded-2xl border border-brand-100 shadow-soft p-4 hover:border-brand-300 transition-all"
              >
                <Clock className="w-5 h-5 text-brand-400 mb-2" />
                <p className="text-sm font-medium text-brand-800">케어톡</p>
                <p className="text-xs text-brand-400 mt-0.5">선생님과 소통</p>
              </a>
            </div>
          </div>
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
