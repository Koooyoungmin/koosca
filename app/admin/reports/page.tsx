"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatTime, getTodayStr } from "@/lib/utils";
import { FileText, Send, Search, Clock, CheckCircle, TrendingUp } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface ReportRow {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  study_seconds: number;
  completed_tasks: number;
  total_tasks: number;
  reflection: string;
  teacher_comment: string;
  sent: boolean;
}

export default function AdminReports() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [selected, setSelected] = useState<ReportRow | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      const today = getTodayStr();
      
      // 1. 모든 학생 프로필 가져오기
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "student");

      if (profileError) throw profileError;

      // 2. 오늘자 보고서 데이터 가져오기
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select("*")
        .eq("date", today);

      if (reportError) throw reportError;

      // 3. 오늘자 학습 통계 및 계획 데이터 가져오기 (보고서가 없을 경우를 대비)
      const { data: statsData } = await supabase
        .from("study_stats")
        .select("*")
        .eq("date", today);

      const { data: planData } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("date", today);

      const reportMap = new Map(reportData?.map(r => [r.student_id, r]) || []);
      const statsMap = new Map(statsData?.map(s => [s.user_id, s]) || []);
      const planMap = new Map(planData?.map(p => [p.user_id, p]) || []);

      const rows: ReportRow[] = profiles.map(p => {
        const existingReport = reportMap.get(p.id);
        const stats = statsMap.get(p.id);
        const plan = planMap.get(p.id);
        
        const completed = plan?.tasks?.filter((t: any) => t.completed).length || 0;
        const total = plan?.tasks?.length || 0;

        return {
          id: existingReport?.id || `new-${p.id}`,
          student_id: p.id,
          student_name: p.name,
          date: today,
          study_seconds: existingReport?.study_seconds || (stats?.daily_minutes || 0) * 60,
          completed_tasks: existingReport?.completed_tasks || completed,
          total_tasks: existingReport?.total_tasks || total,
          reflection: existingReport?.reflection || plan?.reflection || "",
          teacher_comment: existingReport?.teacher_comment || "",
          sent: !!existingReport?.teacher_comment,
        };
      });

      setReports(rows);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!selected) return;
    
    try {
      setSaving(true);
      const isNew = selected.id.startsWith("new-");
      
      const reportData = {
        student_id: selected.student_id,
        date: selected.date,
        study_seconds: selected.study_seconds,
        completed_tasks: selected.completed_tasks,
        total_tasks: selected.total_tasks,
        reflection: selected.reflection,
        teacher_comment: comment,
      };

      let error;
      if (isNew) {
        const { error: insertError } = await supabase.from("reports").insert([reportData]);
        error = insertError;
      } else {
        const { error: updateError } = await supabase
          .from("reports")
          .update(reportData)
          .eq("id", selected.id);
        error = updateError;
      }

      if (error) throw error;
      
      await loadReports();
      setSelected(null);
      setComment("");
      alert("보고서가 저장 및 발송되었습니다.");
    } catch (err) {
      console.error("Error saving report:", err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar role="admin" userName="구영민 선생님" />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="mb-10">
              <h1 className="font-serif text-3xl font-bold text-brand-900">하원 보고서</h1>
              <p className="text-brand-500 font-medium mt-1">학생별 일일 학습 보고서 작성 및 발송</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* 보고서 목록 */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative mb-6">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-300" />
                  <input 
                    type="text" 
                    placeholder="학생 검색..." 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-brand-100 rounded-2xl text-sm font-medium text-brand-900 placeholder:text-brand-300 focus:ring-2 focus:ring-brand-200 transition-all shadow-soft"
                  />
                </div>

                {loading ? (
                  <div className="text-center py-10 text-brand-400 text-sm font-medium">로딩 중...</div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-10 text-brand-400 text-sm font-medium">학생 데이터가 없습니다.</div>
                ) : (
                  reports.map((r) => (
                    <button
                      key={r.student_id}
                      onClick={() => { setSelected(r); setComment(r.teacher_comment); }}
                      className={`w-full text-left rounded-[28px] border p-6 transition-all duration-300 shadow-soft group ${
                        selected?.student_id === r.student_id
                          ? "border-brand-500 bg-white ring-2 ring-brand-100"
                          : "border-transparent bg-white hover:border-brand-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-bold text-brand-900">{r.student_name}</span>
                        {r.sent ? (
                          <span className="text-[10px] font-bold bg-brand-50 text-brand-500 px-2.5 py-1 rounded-full uppercase tracking-wider">발송완료</span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full uppercase tracking-wider">미발송</span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-brand-300 uppercase tracking-widest mb-4">{r.date}</p>
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
                        <h2 className="font-serif text-2xl font-bold text-brand-900">{selected.student_name}</h2>
                        <p className="text-sm text-brand-400 font-medium mt-1">{selected.date} 일일 보고서</p>
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
                      <p className="text-[11px] font-bold text-brand-400 uppercase tracking-widest mb-3">학생 회고</p>
                      <div className="bg-brand-50/30 rounded-2xl p-5 text-sm text-brand-800 leading-relaxed border border-brand-50 italic">
                        "{selected.reflection || "오늘의 회고가 작성되지 않았습니다."}"
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="text-[11px] font-bold text-brand-400 uppercase tracking-widest mb-3">선생님 코멘트</p>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="학부모에게 전달할 코멘트를 작성하세요..."
                        rows={5}
                        className="w-full rounded-2xl border border-brand-100 bg-brand-50/30 px-5 py-4 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition-all resize-none font-medium"
                      />
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-3 bg-brand-900 text-white py-4 rounded-2xl text-sm font-bold hover:bg-brand-800 transition-all shadow-lg shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      {saving ? "저장 중..." : "보고서 저장 및 발송"}
                    </button>
                  </div>
                ) : (
                  <div className="h-[600px] bg-white rounded-[32px] border border-dashed border-brand-200 flex flex-col items-center justify-center text-brand-300 p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-brand-200" />
                    </div>
                    <p className="font-bold text-lg text-brand-400">보고서를 선택하세요</p>
                    <p className="text-sm mt-2 font-medium">왼쪽 목록에서 학생을 선택하여<br />오늘의 학습 보고서를 작성할 수 있습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <BottomNav role="admin" />
      </main>
    </div>
  );
}
