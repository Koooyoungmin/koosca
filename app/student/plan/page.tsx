"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle, Circle, ClipboardList, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface Task {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

const CATEGORIES = ["국어", "영어", "수학", "과학", "사회", "기타"];

const categoryColors: Record<string, string> = {
  국어: "bg-pink-50 text-pink-600 border-pink-100",
  영어: "bg-amber-50 text-amber-600 border-amber-100",
  수학: "bg-brand-50 text-brand-600 border-brand-100",
  과학: "bg-emerald-50 text-emerald-600 border-emerald-100",
  사회: "bg-indigo-50 text-indigo-600 border-indigo-100",
  기타: "bg-slate-50 text-slate-600 border-slate-100",
};

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function PlanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reflection, setReflection] = useState("");
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("수학");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const today = getTodayStr();
      const { data, error } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setPlanId(data.id);
        setTasks(data.tasks || []);
        setReflection(data.reflection || "");
      } else {
        const newPlan = {
          user_id: user.id,
          date: today,
          tasks: [],
          reflection: "",
        };
        const { data: created, error: createError } = await supabase
          .from("daily_plans")
          .insert([newPlan])
          .select()
          .single();

        if (createError) throw createError;
        if (created) {
          setPlanId(created.id);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function savePlan(newTasks: Task[], newReflection: string) {
    if (!planId) return;

    try {
      const { error } = await supabase
        .from("daily_plans")
        .update({
          tasks: newTasks,
          reflection: newReflection,
        })
        .eq("id", planId);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  }

  function addTask() {
    if (!newText.trim()) return;
    const newTasks = [
      ...tasks,
      { id: Date.now().toString(), text: newText, category: newCategory, completed: false },
    ];
    setTasks(newTasks);
    savePlan(newTasks, reflection);
    setNewText("");
  }

  function toggleTask(id: string) {
    const newTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasks);
    savePlan(newTasks, reflection);
  }

  function deleteTask(id: string) {
    const newTasks = tasks.filter((t) => t.id !== id);
    setTasks(newTasks);
    savePlan(newTasks, reflection);
  }

  function updateReflection(value: string) {
    setReflection(value);
    savePlan(tasks, value);
  }

  const completed = tasks.filter((t) => t.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const todayStr = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-brand-50">
        <Sidebar role="student" userName="학생" />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-brand-600 font-medium">로딩 중...</p>
          </div>
          <BottomNav role="student" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar role="student" userName="학생" />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-8">
          <div className="max-w-2xl mx-auto">
            {/* 헤더 */}
            <div className="mb-10">
              <p className="text-sm font-semibold text-brand-400 mb-2 uppercase tracking-widest">{todayStr}</p>
              <h1 className="font-serif text-4xl font-bold text-brand-900 leading-tight">Daily Plan</h1>
              <p className="text-brand-500 font-medium mt-2">오늘의 학습 목표를 세우고 실천하세요.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* 진행률 */}
            <div className="bg-white rounded-[32px] p-8 mb-8 border border-brand-100 shadow-soft">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-900 text-sm">오늘의 달성률</p>
                    <p className="text-[11px] text-brand-400 font-medium">{completed} / {tasks.length} 과제 완료</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-brand-900">{progress}%</p>
              </div>
              <div className="h-2.5 bg-brand-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 할 일 추가 */}
            <div className="bg-white rounded-[32px] p-8 mb-8 border border-brand-100 shadow-soft">
              <p className="text-[11px] font-bold text-brand-400 uppercase tracking-widest mb-4">
                할 일 추가
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      newCategory === cat
                        ? "bg-brand-900 text-white shadow-md shadow-brand-200"
                        : "bg-brand-50 text-brand-500 hover:bg-brand-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="오늘 할 공부를 입력하세요..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  className="flex-1 rounded-2xl border border-brand-100 bg-brand-50/30 px-5 py-4 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition-all font-medium"
                />
                <button
                  onClick={addTask}
                  className="w-14 h-14 bg-brand-900 text-white rounded-2xl flex items-center justify-center hover:bg-brand-800 transition-all shadow-lg shadow-brand-200 flex-shrink-0"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 할 일 목록 */}
            <div className="bg-white rounded-[32px] border border-brand-100 shadow-soft overflow-hidden mb-8">
              <div className="px-8 py-5 border-b border-brand-50 bg-brand-50/30">
                <p className="text-[11px] font-bold text-brand-400 uppercase tracking-widest">할 일 목록</p>
              </div>
              {tasks.length === 0 ? (
                <div className="p-12 text-center text-brand-300 text-sm font-medium">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  오늘의 학습 계획을 추가해보세요
                </div>
              ) : (
                <ul className="divide-y divide-brand-50">
                  {tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-4 px-8 py-5 hover:bg-brand-50/30 transition-colors group"
                    >
                      <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 transition-transform active:scale-90">
                        {task.completed ? (
                          <CheckCircle className="w-6 h-6 text-brand-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-brand-200 group-hover:text-brand-300" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm font-medium ${
                          task.completed ? "line-through text-brand-300" : "text-brand-800"
                        }`}
                      >
                        {task.text}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                          categoryColors[task.category] ?? categoryColors["기타"]
                        }`}
                      >
                        {task.category}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-brand-200 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 오늘의 회고 */}
            <div className="bg-white rounded-[32px] p-8 border border-brand-100 shadow-soft">
              <p className="text-[11px] font-bold text-brand-400 uppercase tracking-widest mb-4">
                오늘의 회고
              </p>
              <textarea
                value={reflection}
                onChange={(e) => updateReflection(e.target.value)}
                placeholder="오늘 공부하면서 느낀 점, 어려웠던 점, 내일의 다짐을 적어보세요..."
                rows={5}
                className="w-full rounded-2xl border border-brand-100 bg-brand-50/30 px-6 py-5 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition-all resize-none font-medium leading-relaxed"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-[11px] text-brand-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-300 animate-pulse" />
                  자동 저장 중
                </p>
                <p className="text-[11px] text-brand-300 font-medium italic">회고는 하원 보고서에 포함됩니다.</p>
              </div>
            </div>
          </div>
        </div>
        <BottomNav role="student" />
      </main>
    </div>
  );
}
