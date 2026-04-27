"use client";

import { useState } from "react";
import { BookOpen, Plus, Trash2, Search } from "lucide-react";

interface Textbook {
  id: string;
  title: string;
  subject: string;
  publisher: string;
  assignedTo: string[];
  stock: number;
}

const SUBJECTS = ["국어", "영어", "수학", "과학", "사회", "기타"];

const MOCK: Textbook[] = [
  { id: "1", title: "수학의 정석 (수학Ⅱ)", subject: "수학", publisher: "성문출판사", assignedTo: ["김민준", "최수아"], stock: 5 },
  { id: "2", title: "EBS 수능특강 영어", subject: "영어", publisher: "EBS", assignedTo: ["이서연", "강하은"], stock: 3 },
  { id: "3", title: "개념원리 미적분", subject: "수학", publisher: "개념원리", assignedTo: ["정도윤"], stock: 8 },
  { id: "4", title: "자이스토리 국어 독서", subject: "국어", publisher: "수경출판사", assignedTo: ["박지호", "임나연"], stock: 4 },
];

const subjectColors: Record<string, string> = {
  국어: "bg-pink-100 text-pink-700",
  영어: "bg-orange-100 text-orange-700",
  수학: "bg-blue-100 text-blue-700",
  과학: "bg-green-100 text-green-700",
  사회: "bg-teal-100 text-teal-700",
  기타: "bg-gray-100 text-gray-700",
};

export default function TextbooksPage() {
  const [textbooks, setTextbooks] = useState<Textbook[]>(MOCK);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "수학", publisher: "", stock: 1 });

  const filtered = textbooks.filter(
    (t) => t.title.includes(search) || t.subject.includes(search) || t.publisher.includes(search)
  );

  function handleAdd() {
    if (!form.title.trim()) return;
    setTextbooks([
      ...textbooks,
      { id: Date.now().toString(), ...form, assignedTo: [] },
    ]);
    setForm({ title: "", subject: "수학", publisher: "", stock: 1 });
    setShowForm(false);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-900">교재 관리</h1>
          <p className="text-brand-500 text-sm mt-1">총 {textbooks.length}종 교재 관리 중</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          교재 추가
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-brand-200 shadow-soft p-6 mb-6">
          <h2 className="font-serif text-lg font-semibold text-brand-900 mb-4">교재 추가</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              placeholder="교재명"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-xl border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
            />
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="rounded-xl border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
            >
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input
              placeholder="출판사"
              value={form.publisher}
              onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              className="rounded-xl border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
            />
            <input
              type="number"
              placeholder="재고"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="rounded-xl border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} className="flex-1 bg-brand-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors">등록</button>
            <button onClick={() => setShowForm(false)} className="flex-1 bg-brand-50 text-brand-600 py-3 rounded-xl text-sm font-medium hover:bg-brand-100 transition-colors">취소</button>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
        <input
          placeholder="교재명, 과목, 출판사 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-200 bg-white text-sm focus:outline-none focus:border-brand-500"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5">
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${subjectColors[t.subject] ?? subjectColors["기타"]}`}>
                {t.subject}
              </span>
              <button
                onClick={() => setTextbooks(textbooks.filter((tb) => tb.id !== t.id))}
                className="p-1 text-brand-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-semibold text-brand-900 mb-1 leading-snug">{t.title}</h3>
            <p className="text-xs text-brand-500 mb-3">{t.publisher}</p>
            <div className="flex items-center justify-between text-xs text-brand-500">
              <span>재고 {t.stock}권</span>
              <span>배정 {t.assignedTo.length}명</span>
            </div>
            {t.assignedTo.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {t.assignedTo.map((name) => (
                  <span key={name} className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
