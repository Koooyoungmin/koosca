"use client";

import { useState } from "react";
import { Bell, Pin, Plus, Trash2, Edit2 } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  pinned: boolean;
}

const MOCK: Notice[] = [
  { id: "1", title: "4월 학습 목표 안내", content: "이번 달 학습 목표는 하루 최소 6시간입니다. 꾸준한 학습으로 목표를 달성해 봅시다!", date: "2026-04-01", pinned: true },
  { id: "2", title: "5월 시험 대비 특강 안내", content: "5월 중간고사 대비 특강이 진행됩니다. 참여 희망자는 관리자에게 문의하세요.", date: "2026-04-15", pinned: true },
  { id: "3", title: "독서실 이용 수칙 안내", content: "1. 음식물 반입 금지\n2. 핸드폰 무음 필수\n3. 외출 시 반드시 관리자에게 알릴 것\n4. 수면은 30분 이내", date: "2026-03-01", pinned: false },
];

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(MOCK);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);

  function handleAdd() {
    if (!title.trim()) return;
    const newNotice: Notice = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString().split("T")[0],
      pinned,
    };
    setNotices([newNotice, ...notices]);
    setTitle(""); setContent(""); setPinned(false);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    setNotices(notices.filter((n) => n.id !== id));
  }

  const sorted = [...notices].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-900">공지사항</h1>
          <p className="text-brand-500 text-sm mt-1">학생 및 학부모에게 공지를 전달합니다</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          공지 작성
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-brand-200 shadow-soft p-6 mb-6">
          <h2 className="font-serif text-lg font-semibold text-brand-900 mb-4">새 공지 작성</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:border-brand-500"
            />
            <textarea
              placeholder="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:border-brand-500 resize-none"
            />
            <label className="flex items-center gap-2 text-sm text-brand-700 cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded"
              />
              상단 고정
            </label>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                className="flex-1 bg-brand-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors"
              >
                등록
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-brand-50 text-brand-600 py-3 rounded-xl text-sm font-medium hover:bg-brand-100 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-2xl border border-brand-100 shadow-soft p-5"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {notice.pinned && <Pin className="w-4 h-4 text-brand-500 flex-shrink-0" />}
                <h3 className="font-semibold text-brand-900">{notice.title}</h3>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="p-1.5 text-brand-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-brand-600 leading-relaxed whitespace-pre-line mb-3">
              {notice.content}
            </p>
            <p className="text-xs text-brand-400">{notice.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
