"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase";

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
  const [showSignup, setShowSignup] = useState(false);
  const [signupName, setSignupName] = useState("");

  const demo = DEMO_ACCOUNTS[role];
  const dest = role === "student" ? "/student" : role === "parent" ? "/parent" : "/admin";

  function handleDemoLogin() {
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

    try {
      const supabase = createClient();

      if (showSignup) {
        if (!signupName.trim()) {
          setError("이름을 입력해 주세요.");
          setLoading(false);
          return;
        }

        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: signupName, role },
          },
        });

        if (signupError) {
          setError(signupError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            role,
            name: signupName,
            email,
          });

          if (profileError) {
            setError("프로필 생성 실패: " + profileError.message);
            setLoading(false);
            return;
          }
        }

        setError(null);
        setShowSignup(false);
        setEmail("");
        setPassword("");
        setSignupName("");
        alert("회원가입 완료! 로그인해 주세요.");
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError(loginError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profileError || !profile) {
            setError("프로필을 찾을 수 없습니다.");
            setLoading(false);
            return;
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("koosca-role", profile.role);
            localStorage.setItem("koosca-user", JSON.stringify(profile));
          }

          router.push(dest);
        }
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-50 flex items-stretch" style={{ backgroundColor: '#eff6ff' }}>
      {/* 배경 장식 */}
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-brand-400/20 to-transparent pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-brand-600/10 to-transparent pointer-events-none" />

      <div className="relative mx-auto flex min-h-screen max-w-[1100px] flex-col items-stretch px-6 lg:flex-row flex-1">
        {/* 좌측 슬로건 */}
        <section className="flex flex-1 flex-col justify-center py-12 lg:py-0 lg:pr-12">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 font-serif text-lg font-bold text-white shadow-lg" style={{ backgroundColor: '#1e3a8a' }}>
              必
            </span>
            <span className="text-sm font-semibold tracking-wider text-brand-600 uppercase" style={{ color: '#2563eb' }}>
              구영민必학원 독서실
            </span>
          </div>
          <h1 className="mt-10 font-serif text-[44px] leading-[1.05] tracking-tight text-brand-900 sm:text-[56px] lg:text-[64px] font-bold" style={{ color: '#1e3a8a' }}>
            오늘도,<br />깊이 있는 학습을.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-brand-600/80" style={{ color: '#2563ebcc' }}>
            학습 시간, 성취율, 하원 보고서까지 — 학생·학부모·관리자가 한 화면에서 같은 그림을 봅니다.
          </p>
          <div className="mt-10 hidden items-center gap-8 text-xs font-semibold text-brand-400 lg:flex">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" style={{ backgroundColor: '#3b82f6' }} /> 실시간 학습
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" style={{ backgroundColor: '#fbbf24' }} /> 외출 관리
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" style={{ backgroundColor: '#94a3b8' }} /> 하원 보고서
            </span>
          </div>
        </section>

        {/* 우측 로그인 폼 */}
        <section className="flex flex-1 items-center justify-center py-12 lg:py-0">
          <div className="w-full max-w-sm space-y-6">
            {/* 데모 빠른 진입 버튼 */}
            <div className="rounded-[32px] border border-brand-100 bg-white/80 p-6 shadow-soft backdrop-blur-md" style={{ borderColor: '#dbeafe' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-4" style={{ color: '#93c5fd' }}>
                데모 — 바로 체험하기
              </p>
              <button
                onClick={handleDemoLogin}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-900 py-4 text-sm font-bold text-white transition-all hover:bg-brand-800 hover:shadow-lg active:scale-[0.98]"
                style={{ backgroundColor: '#1e3a8a' }}
              >
                {demo.label}으로 바로 입장
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
              <p className="mt-4 text-center text-[11px] text-brand-400 font-medium" style={{ color: '#93c5fd' }}>
                ID: {demo.email} / PW: {demo.password}
              </p>
            </div>

            {/* 구분선 */}
            <div className="flex items-center gap-4 px-4">
              <div className="flex-1 h-px bg-brand-100" style={{ backgroundColor: '#dbeafe' }} />
              <span className="text-[11px] font-bold text-brand-300 uppercase tracking-widest" style={{ color: '#93c5fd' }}>또는 직접 로그인</span>
              <div className="flex-1 h-px bg-brand-100" style={{ backgroundColor: '#dbeafe' }} />
            </div>

            {/* 이메일/비밀번호 폼 */}
            <form
              onSubmit={handleSubmit}
              className="rounded-[32px] border border-brand-100 bg-white/80 p-8 shadow-soft backdrop-blur-md sm:p-10"
              style={{ borderColor: '#dbeafe' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-400" style={{ color: '#93c5fd' }}>
                {showSignup ? "회원가입" : demo.label + " 로그인"}
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-brand-900 whitespace-pre-line" style={{ color: '#1e3a8a' }}>
                {showSignup ? "계정을 만들어\n주세요." : "다시 오신 것을\n환영합니다."}
              </h2>

              <div className="mt-10 space-y-6">
                {showSignup && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400 ml-1" style={{ color: '#93c5fd' }}>
                      이름
                    </span>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full border-0 border-b-2 border-brand-100 bg-transparent pb-3 pt-1 text-base font-medium text-brand-900 outline-none transition-all placeholder:text-brand-200 focus:border-brand-500"
                      style={{ borderBottomColor: '#dbeafe', color: '#1e3a8a' }}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400 ml-1" style={{ color: '#93c5fd' }}>
                    이메일
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border-0 border-b-2 border-brand-100 bg-transparent pb-3 pt-1 text-base font-medium text-brand-900 outline-none transition-all placeholder:text-brand-200 focus:border-brand-500"
                    style={{ borderBottomColor: '#dbeafe', color: '#1e3a8a' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400 ml-1" style={{ color: '#93c5fd' }}>
                    비밀번호
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border-0 border-b-2 border-brand-100 bg-transparent pb-3 pt-1 text-base font-medium text-brand-900 outline-none transition-all placeholder:text-brand-200 focus:border-brand-500"
                    style={{ borderBottomColor: '#dbeafe', color: '#1e3a8a' }}
                  />
                </div>
              </div>

              {error && (
                <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-500 border border-red-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-900 py-4 text-sm font-bold text-white transition-all hover:bg-brand-800 hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: '#1e3a8a' }}
              >
                {loading ? "처리 중..." : showSignup ? "가입하기" : "로그인"}
                {!loading && (
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                )}
              </button>

              <p className="mt-6 text-center text-xs font-medium text-brand-500" style={{ color: '#3b82f6' }}>
                {showSignup ? (
                  <>
                    이미 계정이 있으신가요?{" "}
                    <button
                      type="button"
                      onClick={() => setShowSignup(false)}
                      className="font-bold text-brand-900 hover:underline"
                      style={{ color: '#1e3a8a' }}
                    >
                      로그인
                    </button>
                  </>
                ) : (
                  <>
                    계정이 없으신가요?{" "}
                    <button
                      type="button"
                      onClick={() => setShowSignup(true)}
                      className="font-bold text-brand-900 hover:underline"
                      style={{ color: '#1e3a8a' }}
                    >
                      가입하기
                    </button>
                  </>
                )}
              </p>
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
