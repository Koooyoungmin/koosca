"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { formatTime, getTodayStr } from "@/lib/utils";
import { FileText, ChevronRight } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface DailyReport {
  id: string;
  date: string;
  daily_minutes: number;
  tasks: Array<{ completed: boolean }>;
  reflection: string;
  teacher_comment?: string;
}

export default function ParentReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selected, setSelected] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
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

      // 자녀 정보 가져오기 (첫 번째 학생)
      const { data: students, error: studentError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .limit(1)
        .single();

      if (studentError && studentError.code !== "PGRST116") throw studentError;

      if (!students) {
        setReports([]);
        setLoading(false);
        return;
      }

      // 지난 30일의 일일 계획 가져오기
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split("T")[0];

      const { data: plans, error: plansError } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("user_id", students.id)
        .gte("date", startDate)
        .order("date", { ascending: false });

      if (plansError) throw plansError;

      // 각 계획에 대한 통계 정보 가져오기
      const reportsWithStats = await Promise.all(
        (plans || []).map(async (plan) => {
          const { data: stats } = await supabase
            .from("study_stats")
            .select("*")
            .eq("user_id", students.id)
            .eq("date", plan.date)
            .single();

          return {
            id: plan.id,
            date: plan.date,
            daily_minutes: stats?.daily_minutes || 0,
            tasks: plan.tasks || [],
            reflection: plan.reflection || "",
            teacher_comment: plan.teacher_comment,
          };
        })
      );

      setReports(reportsWithStats);
      if (reportsWithStats.length > 0) {
        setSelected(reportsWithStats[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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

  const completedTasks = selected?.tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = selected?.tasks?.length || 0;
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="font-serif text-3xl font-bold text-brand-900">학습 보고서</h1>
              <p className="text-brand-500 text-sm mt-1">자녀의 일일 학습 보고서를 확인하세요</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="grid lg:grid-cols-5 gap-6">
              {/* 보고서 목록 */}
              <div className="lg:col-span-2 space-y-3">
                {reports.length === 0 ? (
                  <div className="p-4 bg-white rounded-2xl border border-brand-100 text-center text-brand-400 text-sm">
                    보고서가 없습니다.
                  </div>
                ) : (
                  reports.map((r) => (
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
                        <span className="font-medium text-brand-900">
                          {new Date(r.date).toLocaleDateString("ko-KR")}
                        </span>
                        <ChevronRight className="w-4 h-4 text-brand-300" />
                      </div>
                      <div className="flex gap-3 text-xs text-brand-500">
                        <span>학습 {formatTime(r.daily_minutes * 60)}</span>
                        <span>
                          달성 {completedTasks}/{totalTasks}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* 보고서 상세 */}
              {selected && (
                <div className="lg:col-span-3 bg-white rounded-2xl border border-brand-100 shadow-soft p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-brand-900">
                        일일 학습 보고서
                      </h2>
                      <p className="text-sm text-brand-500">
                        {new Date(selected.date).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <FileText className="w-6 h-6 text-brand-300" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-brand-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-brand-500 mb-1">학습 시간</p>
                      <p className="font-mono font-bold text-brand-900">
                        {formatTime(selected.daily_minutes * 60)}
                      </p>
                    </div>
                    <div className="bg-brand-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-brand-500 mb-1">과제 달성</p>
                      <p className="font-bold text-brand-900">
                        {completedTasks}/{totalTasks}
                      </p>
                    </div>
                    <div className="bg-brand-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-brand-500 mb-1">달성률</p>
                      <p className="font-bold text-brand-900">{progress}%</p>
                    </div>
                  </div>

                  {selected.reflection && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-2">
                        자녀 회고
                      </p>
                      <div className="bg-brand-50 rounded-xl p-4 text-sm text-brand-800 leading-relaxed">
                        {selected.reflection}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-2">
                      선생님 코멘트
                    </p>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800 leading-relaxed">
                      {selected.teacher_comment || "아직 코멘트가 없습니다."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
