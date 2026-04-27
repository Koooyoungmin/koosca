"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTime } from "@/lib/utils";
import { Search, Plus, Phone, ChevronRight } from "lucide-react";

interface Student {
  id: string;
  name: string;
  grade: string;
  seat: number;
  status: "study" | "outing" | "sleep" | "away";
  phone: string;
  parentPhone: string;
  todaySeconds: number;
  weekSeconds: number;
  memo: string;
}

const MOCK: Student[] = [
  { id: "1", name: "김민준", grade: "고2", seat: 1, status: "study", phone: "010-1234-5678", parentPhone: "010-9876-5432", todaySeconds: 14400, weekSeconds: 86400, memo: "수학 집중 학습" },
  { id: "2", name: "이서연", grade: "고1", seat: 2, status: "study", phone: "010-2345-6789", parentPhone: "010-8765-4321", todaySeconds: 12600, weekSeconds: 72000, memo: "" },
  { id: "3", name: "박지호", grade: "중3", seat: 3, status: "outing", phone: "010-3456-7890", parentPhone: "010-7654-3210", todaySeconds: 9000, weekSeconds: 54000, memo: "외출 15분 허용" },
  { id: "4", name: "최수아", grade: "고2", seat: 4, status: "study", phone: "010-4567-8901", parentPhone: "010-6543-2109", todaySeconds: 18000, weekSeconds: 108000, memo: "" },
  { id: "5", name: "정도윤", grade: "고3", seat: 5, status: "sleep", phone: "010-5678-9012", parentPhone: "010-5432-1098", todaySeconds: 7200, weekSeconds: 43200, memo: "수면 30분 허용" },
  { id: "6", name: "강하은", grade: "고1", seat: 6, status: "study", phone: "010-6789-0123", parentPhone: "010-4321-0987", todaySeconds: 21600, weekSeconds: 129600, memo: "" },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(MOCK);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);

  const filtered = students.filter(
    (s) =>
      s.name.includes(search) ||
      s.grade.includes(search) ||
      String(s.seat).includes(search)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-900">학생 관리</h1>
          <p className="text-brand-500 text-sm mt-1">총 {students.length}명 등록</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors">
          <Plus className="w-4 h-4" />
          학생 추가
        </button>
      </div>

      {/* 검색 */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
        <input
          type="text"
          placeholder="이름, 학년, 좌석번호 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-200 bg-white text-brand-900 placeholder:text-brand-300 focus:outline-none focus:border-brand-500 text-sm"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 학생 목록 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-100 shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-brand-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-brand-500">좌석</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-brand-500">이름</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-brand-500">학년</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-brand-500">상태</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-brand-500">오늘</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`cursor-pointer hover:bg-brand-50/50 transition-colors ${selected?.id === s.id ? "bg-brand-50" : ""}`}
                >
                  <td className="px-5 py-4 text-sm text-brand-500">{s.seat}번</td>
                  <td className="px-5 py-4 font-medium text-brand-900">{s.name}</td>
                  <td className="px-5 py-4 text-sm text-brand-600">{s.grade}</td>
                  <td className="px-5 py-4"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-4 font-mono text-sm text-brand-700">{formatTime(s.todaySeconds)}</td>
                  <td className="px-5 py-4"><ChevronRight className="w-4 h-4 text-brand-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 학생 상세 */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-brand-100 shadow-soft p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-brand-900">{selected.name}</h3>
                <p className="text-sm text-brand-500">{selected.grade} · {selected.seat}번 좌석</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brand-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-brand-500 mb-1">오늘 학습</p>
                  <p className="font-mono font-bold text-brand-900">{formatTime(selected.todaySeconds)}</p>
                </div>
                <div className="bg-brand-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-brand-500 mb-1">주간 학습</p>
                  <p className="font-mono font-bold text-brand-900">{formatTime(selected.weekSeconds)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-brand-700">
                  <Phone className="w-4 h-4 text-brand-400" />
                  <span>{selected.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-700">
                  <Phone className="w-4 h-4 text-brand-400" />
                  <span>학부모: {selected.parentPhone}</span>
                </div>
              </div>

              {selected.memo && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                  <p className="text-xs text-yellow-700 font-medium mb-1">메모</p>
                  <p className="text-sm text-yellow-800">{selected.memo}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-medium text-brand-500 uppercase tracking-wider">상태 변경</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["study", "outing", "sleep", "away"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelected({ ...selected, status: s });
                      }}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        selected.status === s
                          ? "bg-brand-900 text-white"
                          : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                      }`}
                    >
                      {s === "study" ? "학습" : s === "outing" ? "외출" : s === "sleep" ? "수면" : "하원"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-brand-200 p-6 flex items-center justify-center text-brand-300 text-sm">
            학생을 선택하면 상세 정보가 표시됩니다
          </div>
        )}
      </div>
    </div>
  );
}
