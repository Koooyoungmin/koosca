"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatTime } from "@/lib/utils";
import { FileText, ChevronRight, Clock, CheckCircle, MessageCircle, Calendar } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface Report {
  id: string;
  student_id: string;
  date: string;
  study_seconds: number;
  completed_tasks: number;
  total_tasks: number;
  reflection: string;
  teacher_comment: string;
  created_at: string;
}

export default function ParentReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      // 현재는 학부모-학생 관계 테이블이 없으므로, 
      // 모든 학생의 보고서를 불러오도록 수정하여 데이터가 보이는지 확인합니다.
      // (실제 운영 시에는 .eq("student_id", 자녀ID) 필터가 필요합니다)
      const { data, error: reportError } = await supabase
        .from("reports")
        .select("*")
        .order("date", { ascending: false });

      if (reportError) throw reportError;

      setReports(data || []);
      if (data && data.length > 0) {
        setSelected(data[0]);
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

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar role="parent" userName="학부모" />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-8">
          <div className="max-w-5xl mx-auto">
            {/* 헤더 */}
            <div className="mb-10">
              <h1 className="font-serif text-3xl font-bold text-brand-900">학습 보고서</h1>
              <p className="text-brand-500 font-medium mt-1">자녀의 일일 학습 보고서를 확인하세요</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid lg:grid-cols-5 gap-8">
              {/* 보고서 목록 */}
              <div className="lg:col-span-2 space-y-4">
                <div className="px-2 mb-2">
                  <p className="text-[11px] font-bold text-brand-400 uppercase tracking-widest">최근 보고서</p>
                </div>
                {reports.length === 0 ? (
                  <div className="p-10 bg-white rounded-[32px] border border-brand-100 text-center text-brand-300 font-medium shadow-soft">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    아직 발행된 보고서가 없습니다.
                  </div>
                ) : (
                  reports.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className={`w-full text-left rounded-[28px] border p-6 transition-all duration-300 shadow-soft group ${
                        selected?.id === r.id
                          ? "border-brand-500 bg-white ring-2 ring-brand-100"
                          : "border-transparent bg-white hover:border-brand-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-brand-900">
                          {new Date(r.date).toLocaleDateString("ko-KR", { month: 'long', day: 'numeric', weekday: 'short' })}
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${selected?.id === r.id ? "text-brand-500 translate-x-1" : "text-brand-200"}`} />
                      </div>
                      <div className="flex gap-4 text-[11px] font-bold text-brand-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(r.study_seconds)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          달성 {r.completed_tasks}/{r.total_tasks}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* 보고서 상세 */}
              <div className="lg:col-span-3">
                {selected ? (
                  <div className="bg-white rounded-[32px] border border-brand-100 shadow-soft p-8 sticky top-6">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-brand-900">일일 학습 보고서</h2>
                        <p className="text-sm text-brand-400 font-medium mt-1">
                          {new Date(selected.date).toLocaleDateString("ko-KR", { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-brand-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-brand-50/50 rounded-2xl p-4 text-center border border-brand-50">
                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">학습 시간</p>
                        <p className="font-mono font-bold text-brand-900 text-lg">{formatTime(selected.study_seconds)}</p>
                      </div>
                      <div className="bg-brand-50/50 rounded-2xl p-4 text-center border border-brand-50">
                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">과제 달성</p>
                        <p className="font-bold text-brand-900 text-lg">{selected.completed_tasks}/{selected.total_tasks}</p>
                      </div>
                      <div className="bg-brand-50/50 rounded-2xl p-4 text-center border border-brand-50">
                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">달성률</p>
                        <p className="font-bold text-brand-900 text-lg">
                          {selected.total_tasks ? Math.round((selected.completed_tasks / selected.total_tasks) * 100) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="text-[11px] font-bold text-brand-400 uppercase tracking-widest mb-3">자녀 회고</p>
                      <div className="bg-brand-50/30 rounded-2xl p-6 text-sm text-brand-800 leading-relaxed border border-brand-50 italic">
                        "{selected.reflection || "오늘의 회고가 작성되지 않았습니다."}"
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-brand-400 uppercase tracking-widest mb-3">선생님 코멘트</p>
                      <div className="bg-brand-900 rounded-[24px] p-6 text-sm text-white leading-relaxed shadow-lg shadow-brand-100 relative overflow-hidden">
                        <MessageCircle className="w-12 h-12 absolute -bottom-2 -right-2 text-white/10" />
                        <p className="relative z-10 font-medium">
                          {selected.teacher_comment || "선생님의 코멘트가 아직 작성되지 않았습니다."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[500px] bg-white rounded-[32px] border border-dashed border-brand-200 flex flex-col items-center justify-center text-brand-300 p-10 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-lg text-brand-400">보고서를 선택하세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <BottomNav role="parent" />
      </main>
    </div>
  );
}
