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
    <main className="min-h-screen bg-brand-50 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden" style={{ backgroundColor: '#eff6ff' }}>
      {/* 배경 장식 */}
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-brand-400/20 to-transparent pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-brand-600/10 to-transparent pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-900 font-serif text-xl font-bold text-white shadow-lg" style={{ backgroundColor: '#1e3a8a' }}>
              必
            </span>
            <span className="text-sm font-semibold tracking-wider text-brand-600 uppercase" style={{ color: '#2563eb' }}>
              구영민必학원 독서실
            </span>
          </div>
          <h1 className="font-serif text-5xl sm:text-7xl font-bold text-brand-900 leading-[1.1] tracking-tight mb-6" style={{ color: '#1e3a8a' }}>
            오늘도,<br />깊이 있는 학습을.
          </h1>
          <p className="text-brand-600/80 text-lg max-w-lg mx-auto leading-relaxed" style={{ color: '#2563ebcc' }}>
            학습 시간, 성취율, 하원 보고서까지 — 학생·학부모·관리자가 한 화면에서 같은 그림을 봅니다.
          </p>
        </div>

        {/* 역할 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {roles.map((role) => (
            <Link
              key={role.key}
              href={role.href}
              className="group block rounded-[32px] border border-brand-100 bg-white/80 backdrop-blur-md p-8 shadow-soft hover:shadow-xl hover:border-brand-300 hover:-translate-y-2 transition-all duration-300"
              style={{ borderColor: '#dbeafe', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#eff6ff' }}>
                {role.icon}
              </div>
              <h2 className="font-serif text-2xl font-bold text-brand-900 mb-3" style={{ color: '#1e3a8a' }}>
                {role.label}
              </h2>
              <p className="text-sm text-brand-500 leading-relaxed" style={{ color: '#3b82f6' }}>
                {role.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* 상태 표시 */}
        <div className="flex items-center justify-center gap-8 text-xs font-semibold text-brand-400">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" style={{ backgroundColor: '#3b82f6' }} />
            실시간 학습
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" style={{ backgroundColor: '#fbbf24' }} />
            외출 관리
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-400" style={{ backgroundColor: '#94a3b8' }} />
            하원 보고서
          </span>
        </div>
      </div>
    </main>
  );
}
