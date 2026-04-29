"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface Task {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

interface DailyPlan {
  id: string;
  user_id: string;
  date: string;
  tasks: Task[];
  reflection: string;
}

const CATEGORIES = ["국어", "영어", "수학", "과학", "사회", "기타"];

const categoryColors: Record<string, string> = {
  국어: "bg-pink-100 text-pink-700",
  영어: "bg-orange-100 text-orange-700",
  수학: "bg-blue-100 text-blue-700",
  과학: "bg-green-100 text-green-700",
  사회: "bg-teal-100 text-teal-700",
  기타: "bg-gray-100 text-gray-700",
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

  // 초기 데이터 로드
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
        // 새로운 계획 생성
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <p className="text-sm text-brand-500 mb-1">{todayStr}</p>
              <h1 className="font-serif text-3xl font-bold text-brand-900">Daily Plan</h1>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* 진행률 */}
            <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-brand-700">오늘의 달성률</p>
                <p className="text-2xl font-bold text-brand-900">{progress}%</p>
              </div>
              <div className="h-3 bg-brand-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-700 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-brand-400 mt-2">
                {completed} / {tasks.length} 완료
              </p>
            </div>

            {/* 할 일 추가 */}
            <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5 mb-6">
              <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-3">
                할 일 추가
              </p>
              <div className="flex gap-2 mb-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      newCategory === cat
                        ? "bg-brand-900 text-white"
                        : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="오늘 할 공부를 입력하세요..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  className="flex-1 rounded-xl border border-brand-200 px-4 py-3 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:border-brand-500"
                />
                <button
                  onClick={addTask}
                  className="px-4 py-3 bg-brand-900 text-white rounded-xl hover:bg-brand-800 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 할 일 목록 */}
            <div className="bg-white rounded-2xl border border-brand-100 shadow-soft overflow-hidden mb-6">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-brand-300 text-sm">
                  오늘의 학습 계획을 추가해보세요
                </div>
              ) : (
                <ul className="divide-y divide-brand-50">
                  {tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-brand-50/50 transition-colors"
                    >
                      <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-status-study" />
                        ) : (
                          <Circle className="w-5 h-5 text-brand-200" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          task.completed ? "line-through text-brand-300" : "text-brand-800"
                        }`}
                      >
                        {task.text}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          categoryColors[task.category] ?? categoryColors["기타"]
                        }`}
                      >
                        {task.category}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-brand-200 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 오늘의 회고 */}
            <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5">
              <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-3">
                오늘의 회고
              </p>
              <textarea
                value={reflection}
                onChange={(e) => updateReflection(e.target.value)}
                placeholder="오늘 공부하면서 느낀 점, 어려웠던 점, 내일의 다짐을 적어보세요..."
                rows={5}
                className="w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:border-brand-500 resize-none"
              />
              <p className="text-xs text-brand-400 mt-2">자동 저장됩니다</p>
            </div>
          </div>
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
