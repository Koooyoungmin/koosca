"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";

interface Task {
  id: string;
  text: string;
  category: string;
  completed: boolean;
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
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`koosca-plan-${getTodayStr()}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [reflection, setReflection] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`koosca-reflection-${getTodayStr()}`) ?? "";
  });
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("수학");

  useEffect(() => {
    localStorage.setItem(`koosca-plan-${getTodayStr()}`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`koosca-reflection-${getTodayStr()}`, reflection);
  }, [reflection]);

  function addTask() {
    if (!newText.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newText, category: newCategory, completed: false }]);
    setNewText("");
  }

  function toggleTask(id: string) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  const completed = tasks.filter((t) => t.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const todayStr = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-brand-500 mb-1">{todayStr}</p>
        <h1 className="font-serif text-3xl font-bold text-brand-900">Daily Plan</h1>
      </div>

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
        <p className="text-xs text-brand-400 mt-2">{completed} / {tasks.length} 완료</p>
      </div>

      {/* 할 일 추가 */}
      <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5 mb-6">
        <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-3">할 일 추가</p>
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
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[task.category] ?? categoryColors["기타"]}`}>
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
        <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-3">오늘의 회고</p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="오늘 공부하면서 느낀 점, 어려웠던 점, 내일의 다짐을 적어보세요..."
          rows={5}
          className="w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:border-brand-500 resize-none"
        />
        <p className="text-xs text-brand-400 mt-2">자동 저장됩니다</p>
      </div>
    </div>
  );
}
