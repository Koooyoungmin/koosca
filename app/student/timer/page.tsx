"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/utils";
import { Play, Pause, Square, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getMondayStr() {
  return getMonday(new Date()).toISOString().split("T")[0];
}

interface StudyStats {
  id: string;
  user_id: string;
  date: string;
  daily_minutes: number;
  weekly_minutes: number;
  monthly_minutes: number;
  week_start_date: string;
  month_start_date: string;
}

const DEFAULT_STATS: StudyStats = {
  id: "",
  user_id: "",
  date: getTodayStr(),
  daily_minutes: 0,
  weekly_minutes: 0,
  monthly_minutes: 0,
  week_start_date: getMondayStr(),
  month_start_date: new Date().toISOString().slice(0, 7) + "-01",
};

export default function TimerPage() {
  const [stats, setStats] = useState<StudyStats>(DEFAULT_STATS);
  const [isRunning, setIsRunning] = useState(false);
  const [session, setSession] = useState(0);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  // 초기 데이터 로드
  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const today = getTodayStr();
      const { data, error } = await supabase
        .from("study_stats")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setStats(data);
      } else {
        // 새로운 레코드 생성
        const newStats = {
          ...DEFAULT_STATS,
          user_id: user.id,
        };
        const { data: created, error: createError } = await supabase
          .from("study_stats")
          .insert([newStats])
          .select()
          .single();

        if (createError) throw createError;
        if (created) setStats(created);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 타이머 - 1초마다 증가
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSession((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // 세션 종료 시 Supabase에 저장
  async function handleStop() {
    setIsRunning(false);

    if (session === 0) return;

    try {
      const minutes = Math.floor(session / 60);
      if (minutes === 0) {
        setSession(0);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const today = getTodayStr();
      const { error } = await supabase
        .from("study_stats")
        .update({
          daily_minutes: stats.daily_minutes + minutes,
          weekly_minutes: stats.weekly_minutes + minutes,
          monthly_minutes: stats.monthly_minutes + minutes,
        })
        .eq("user_id", user.id)
        .eq("date", today);

      if (error) throw error;

      setStats((prev) => ({
        ...prev,
        daily_minutes: prev.daily_minutes + minutes,
        weekly_minutes: prev.weekly_minutes + minutes,
        monthly_minutes: prev.monthly_minutes + minutes,
      }));

      setSession(0);
    } catch (err: any) {
      setError(err.message);
    }
  }

  // 시계
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const todayStr = now.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const timeStr = now.toLocaleTimeString("ko-KR", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-brand-50">
        <Sidebar role="student" />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-brand-600">로딩 중...</p>
          </div>
          <BottomNav role="student" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar role="student" />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-6">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <h1 className="font-serif text-3xl font-bold text-brand-900">학습 타이머</h1>
              <p className="text-brand-500 text-sm mt-1">집중 학습 시간을 기록합니다</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-6 mb-6">
              {/* 날짜 & 현재 시각 */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-brand-100">
                <div>
                  <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-1">
                    {todayStr}
                  </p>
                  <p className="text-2xl font-bold text-brand-800 font-mono tabular-nums">{timeStr}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brand-400 mb-1">오늘 누적</p>
                  <p className="text-lg font-bold text-brand-700 font-mono tabular-nums">
                    {formatTime(stats.daily_minutes * 60)}
                  </p>
                </div>
              </div>

              {/* 스톱워치 */}
              <div className="flex flex-col items-center py-4">
                <p className="text-xs text-brand-500 mb-2 font-medium uppercase tracking-wider">
                  현재 세션
                </p>
                <p
                  className={cn(
                    "text-6xl font-black tracking-tight mb-8 tabular-nums font-mono",
                    isRunning ? "text-brand-900" : "text-brand-200"
                  )}
                >
                  {formatTime(session)}
                </p>
                <div className="flex items-center gap-5">
                  {!isRunning ? (
                    <button
                      onClick={() => setIsRunning(true)}
                      className="w-16 h-16 rounded-full bg-brand-900 text-white flex items-center justify-center hover:bg-brand-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-900/20"
                    >
                      <Play className="w-7 h-7 ml-1" />
                    </button>
                  ) : (
                    <button
                      onClick={handleStop}
                      className="w-16 h-16 rounded-full bg-status-outing text-white flex items-center justify-center hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-status-outing/30"
                    >
                      <Pause className="w-7 h-7" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsRunning(false);
                      setSession(0);
                    }}
                    disabled={session === 0 && !isRunning}
                    className="w-16 h-16 rounded-full bg-brand-100 text-brand-500 flex items-center justify-center hover:bg-brand-200 disabled:opacity-40 transition-all"
                  >
                    <Square className="w-6 h-6 fill-current" />
                  </button>
                </div>
              </div>

              {/* 통계 */}
              <div className="mt-6 pt-4 border-t border-brand-100 grid grid-cols-2 gap-3">
                <div className="bg-brand-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-brand-500 mb-1">주간 누적</p>
                  <p className="font-bold text-brand-800 font-mono tabular-nums">
                    {formatTime(stats.weekly_minutes * 60)}
                  </p>
                </div>
                <div className="bg-brand-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-brand-500 mb-1">월간 누적</p>
                  <p className="font-bold text-brand-800 font-mono tabular-nums">
                    {formatTime(stats.monthly_minutes * 60)}
                  </p>
                </div>
              </div>
            </div>

            {/* 학습 팁 */}
            <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100">
              <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-2">
                학습 팁
              </p>
              <p className="text-sm text-brand-700 leading-relaxed">
                포모도로 기법: 25분 집중 후 5분 휴식을 반복하면 집중력을 유지하는 데 효과적입니다.
              </p>
            </div>
          </div>
        </div>
        <BottomNav role="student" />
      </main>
    </div>
  );
}
