"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface Profile {
  id: string;
  role: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "student",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // 1. 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name, role: formData.role },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("사용자 생성 실패");

      // 2. 프로필 생성
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        role: formData.role,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      if (profileError) throw profileError;

      setSuccess(`${formData.name} 회원이 등록되었습니다.`);
      setFormData({ name: "", email: "", password: "", phone: "", role: "student" });
      setShowForm(false);
      loadMembers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${name} 회원을 삭제하시겠습니까?`)) return;

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      setSuccess(`${name} 회원이 삭제되었습니다.`);
      loadMembers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar role="admin" />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-6">
          <div className="max-w-4xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-serif text-brand-900">회원 관리</h1>
                <p className="text-brand-600 mt-1">학생, 학부모, 관리자 회원을 등록하고 관리합니다.</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-3 bg-brand-900 text-white rounded-full font-medium hover:bg-brand-800 transition"
              >
                {showForm ? "취소" : "+ 회원 등록"}
              </button>
            </div>

            {/* 메시지 */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {success}
              </div>
            )}

            {/* 회원 등록 폼 */}
            {showForm && (
              <div className="mb-8 p-6 bg-white rounded-2xl border border-brand-200 shadow-soft">
                <h2 className="text-xl font-serif text-brand-900 mb-6">새 회원 등록</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label>
                      <span className="text-sm font-medium text-brand-700">이름 *</span>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-2 w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="홍길동"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-medium text-brand-700">이메일 *</span>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-2 w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="user@example.com"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-medium text-brand-700">비밀번호 *</span>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-2 w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="••••••••"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-medium text-brand-700">전화번호</span>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-2 w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="010-1234-5678"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-medium text-brand-700">역할 *</span>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="mt-2 w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="student">학생</option>
                        <option value="parent">학부모</option>
                        <option value="admin">관리자</option>
                      </select>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-brand-900 text-white rounded-lg font-medium hover:bg-brand-800 transition"
                  >
                    회원 등록
                  </button>
                </form>
              </div>
            )}

            {/* 회원 목록 */}
            <div className="bg-white rounded-2xl border border-brand-200 shadow-soft overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-brand-600">로딩 중...</div>
              ) : members.length === 0 ? (
                <div className="p-8 text-center text-brand-600">등록된 회원이 없습니다.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-brand-50 border-b border-brand-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-900">이름</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-900">이메일</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-900">역할</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-900">전화</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-900">가입일</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-900">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-brand-100 hover:bg-brand-50">
                          <td className="px-6 py-4 text-brand-900 font-medium">{member.name}</td>
                          <td className="px-6 py-4 text-brand-600">{member.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              member.role === "admin" ? "bg-red-100 text-red-700" :
                              member.role === "student" ? "bg-blue-100 text-blue-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {member.role === "admin" ? "관리자" : member.role === "student" ? "학생" : "학부모"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-brand-600">{member.phone || "-"}</td>
                          <td className="px-6 py-4 text-brand-600 text-sm">
                            {new Date(member.created_at).toLocaleDateString("ko-KR")}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(member.id, member.name)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        <BottomNav role="admin" />
      </main>
    </div>
  );
}
