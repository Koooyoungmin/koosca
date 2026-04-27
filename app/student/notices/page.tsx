"use client";

import { useState } from "react";
import { Pin, Bell } from "lucide-react";

const MOCK = [
  { id: "1", title: "4월 학습 목표 안내", content: "이번 달 학습 목표는 하루 최소 6시간입니다. 꾸준한 학습으로 목표를 달성해 봅시다!", date: "2026-04-01", pinned: true },
  { id: "2", title: "5월 시험 대비 특강 안내", content: "5월 중간고사 대비 특강이 진행됩니다. 참여 희망자는 관리자에게 문의하세요.", date: "2026-04-15", pinned: true },
  { id: "3", title: "독서실 이용 수칙 안내", content: "1. 음식물 반입 금지\n2. 핸드폰 무음 필수\n3. 외출 시 반드시 관리자에게 알릴 것\n4. 수면은 30분 이내", date: "2026-03-01", pinned: false },
];

export default function StudentNoticesPage() {
  const [selected, setSelected] = useState<(typeof MOCK)[0] | null>(null);
  const sorted = [...MOCK].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-900">공지사항</h1>
        <p className="text-brand-500 text-sm mt-1">학원 공지 및 안내사항</p>
      </div>

      <div className="space-y-3">
        {sorted.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(selected?.id === n.id ? null : n)}
            className="w-full text-left bg-white rounded-2xl border border-brand-100 shadow-soft p-5 hover:border-brand-300 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {n.pinned ? (
                  <Pin className="w-4 h-4 text-brand-500" />
                ) : (
                  <Bell className="w-4 h-4 text-brand-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-brand-900">{n.title}</h3>
                  {n.pinned && (
                    <span className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full">고정</span>
                  )}
                </div>
                <p className="text-xs text-brand-400">{n.date}</p>
                {selected?.id === n.id && (
                  <p className="mt-3 text-sm text-brand-700 leading-relaxed whitespace-pre-line border-t border-brand-100 pt-3">
                    {n.content}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
