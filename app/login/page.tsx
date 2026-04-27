"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// 데모 계정 정보
const DEMO_ACCOUNTS = {
  admin: { email: "admin@koosca.kr", password: "admin1234", label: "관리자" },
  student: { email: "student@koosca.kr", password: "student1234", label: "학생" },
  parent: { email: "parent@koosca.kr", password: "parent1234", label: "학부모" },
};

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (searchParams.get("role") ?? "admin") as "admin" | "student" | "parent";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const demo = DEMO_ACCOUNTS[role];
  const dest = role === "student" ? "/student" : role === "parent" ? "/parent" : "/admin";

  function handleDemoLogin() {
    // 데모 계정으로 바로 진입
    if (typeof window !== "undefined") {
      localStorage.setItem("koosca-role", role);
      localStorage.setItem("koosca-user", JSON.stringify({ role, name: demo.label }));
    }
    router.push(dest);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 데모 모드: 이메일/비밀번호 일치 시 바로 진입
    if (email === demo.email && password === demo.password) {
      if (typeof window !== "undefined") {
        localStorage.setItem("koosca-role", role);
        localStorage.setItem("koosca-user", JSON.stringify({ role, name: demo.label }));
      }
      router.push(dest);
      return;
    }

    setLoading(false);
    setError("이메일 또는 비밀번호가 올바르지 않습니다. 아래 데모 계정을 사용해 보세요.");
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
          <div className="w-full max-w-sm space-y-4">
            {/* 데모 빠른 진입 버튼 */}
            <div className="rounded-2xl border border-brand-200 bg-white/70 p-5 shadow-soft backdrop-blur-sm">
              <p className="font-display text-[11px] uppercase tracking-[0.14em] text-brand-500 mb-3">
                데모 — 바로 체험하기
              </p>
              <button
                onClick={handleDemoLogin}
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-brand-900 py-3 font-display text-sm font-medium text-brand-50 transition hover:bg-brand-800"
              >
                {demo.label}으로 바로 입장
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </button>
              <p className="mt-3 text-center text-[11px] text-brand-400">
                ID: {demo.email} / PW: {demo.password}
              </p>
            </div>

            {/* 구분선 */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-brand-200" />
              <span className="text-xs text-brand-400">또는 직접 로그인</span>
              <div className="flex-1 h-px bg-brand-200" />
            </div>

            {/* 이메일/비밀번호 폼 */}
            <form
              onSubmit={handleSubmit}
              className="rounded-[28px] border border-brand-200 bg-white/70 p-8 shadow-soft backdrop-blur-sm sm:p-10"
            >
              <p className="font-display text-xs uppercase tracking-[0.18em] text-brand-500">
                {demo.label} 로그인
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
                    placeholder={demo.email}
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
            </form>
          </div>
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
