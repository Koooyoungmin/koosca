import Link from "next/link";

const roles = [
  {
    key: "admin",
    label: "관리자",
    desc: "전체 학생 실시간 모니터링 · 보고서 · 교재 관리",
    href: "/login?role=admin",
    icon: "🏫",
  },
  {
    key: "student",
    label: "학생",
    desc: "등원 · 학습 타이머 · Daily Plan",
    href: "/login?role=student",
    icon: "📚",
  },
  {
    key: "parent",
    label: "학부모",
    desc: "자녀 학습 현황 · 보고서 · 케어톡",
    href: "/login?role=parent",
    icon: "👨‍👩‍👧",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-900 font-serif text-xl font-semibold text-brand-50 shadow-soft">
              必
            </span>
            <span className="font-display text-sm tracking-wide text-brand-700">
              구영민必학원 부속
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-900 leading-tight mb-4">
            관리형 독서실
          </h1>
          <p className="text-brand-700/70 text-base max-w-md mx-auto leading-relaxed">
            학습시간 · 계획 · 성취율을 실시간으로 관리하는 시스템
          </p>
        </div>

        {/* 역할 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {roles.map((role) => (
            <Link
              key={role.key}
              href={role.href}
              className="group block rounded-2xl border border-brand-200 bg-white/70 backdrop-blur-sm p-6 shadow-soft hover:shadow-md hover:border-brand-400 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-3xl mb-3">{role.icon}</div>
              <h2 className="font-serif text-xl font-semibold text-brand-900 mb-2">
                {role.label}
              </h2>
              <p className="text-sm text-brand-600 leading-relaxed">
                {role.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* 상태 표시 */}
        <div className="flex items-center justify-center gap-6 text-xs text-brand-400">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-study animate-pulse" />
            실시간 학습
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-outing" />
            외출 관리
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-sleep" />
            하원 보고서
          </span>
        </div>

        <p className="text-center text-xs text-brand-300 mt-8">
          MVP · Phase 1 기반 구축 중
        </p>
      </div>
    </main>
  );
}
