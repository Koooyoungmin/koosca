"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (searchParams.get("role") ?? "admin") as "admin" | "student" | "parent";
  const next = searchParams.get("next") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleLabel = role === "student" ? "학생" : role === "parent" ? "학부모" : "관리자";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    setLoading(false);

    const userRole = profile?.role ?? role;
    const dest = next || (userRole === "student" ? "/student" : userRole === "parent" ? "/parent" : "/admin");
    router.push(dest);
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-50">
      {/* 배경 블러 원 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full opacity-[0.18] blur-3xl"
        style={{ background: "radial-gradient(circle, #d97757 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: "radial-gradient(circle, #6a9bcc 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-stretch px-6 lg:flex-row">
        {/* 좌측 슬로건 */}
        <section className="flex flex-1 flex-col justify-center py-12 lg:py-0 lg:pr-12">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 font-serif text-lg font-semibold text-brand-50">
              必
            </span>
            <span className="font-display text-sm tracking-wide text-brand-700">
              구영민必학원 독서실
            </span>
          </div>
          <h1 className="mt-10 font-serif text-[44px] leading-[1.05] tracking-tight text-brand-900 sm:text-[56px] lg:text-[64px]">
            오늘도,
            <br />
            <span className="italic text-brand-700">깊이 있는</span> 학습을.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-brand-800/70">
            학습 시간, 성취율, 하원 보고서까지 — 학생·학부모·관리자가 한 화면에서 같은 그림을 봅니다.
          </p>
          <div className="mt-10 hidden items-center gap-6 text-xs text-brand-400 lg:flex">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-status-study" /> 실시간 학습
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-status-outing" /> 외출 관리
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-status-sleep" /> 하원 보고서
            </span>
          </div>
        </section>

        {/* 우측 로그인 폼 */}
        <section className="flex flex-1 items-center justify-center py-12 lg:py-0">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm rounded-[28px] border border-brand-200 bg-white/70 p-8 shadow-soft backdrop-blur-sm sm:p-10"
          >
            <p className="font-display text-xs uppercase tracking-[0.18em] text-brand-500">
              {roleLabel} 로그인
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-brand-900">
              다시 오신 것을
              <br />
              환영합니다.
            </h2>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="font-display text-[11px] uppercase tracking-[0.14em] text-brand-500">
                  이메일
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full border-0 border-b border-brand-200 bg-transparent pb-2 pt-1 text-base text-brand-900 outline-none transition placeholder:text-brand-300 focus:border-brand-500"
                />
              </label>
              <label className="block">
                <span className="font-display text-[11px] uppercase tracking-[0.14em] text-brand-500">
                  비밀번호
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full border-0 border-b border-brand-200 bg-transparent pb-2 pt-1 text-base text-brand-900 outline-none transition placeholder:text-brand-300 focus:border-brand-500"
                />
              </label>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-brand-900 py-3 font-display text-sm font-medium text-brand-50 transition hover:bg-brand-800 disabled:opacity-50"
            >
              {loading ? "로그인 중..." : "로그인"}
              {!loading && (
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              )}
            </button>

            <p className="mt-6 text-center text-xs text-brand-400">
              계정 문제가 있으면 관리자에게 문의하세요.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
