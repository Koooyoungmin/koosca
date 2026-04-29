"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Bell,
  LogOut,
  Timer,
  ClipboardList,
  BarChart2,
  MessageCircle,
  MessagesSquare,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const adminNav: NavItem[] = [
  { href: "/admin", label: "대시보드", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/admin/students", label: "학생 관리", icon: <Users className="w-5 h-5" /> },
  { href: "/admin/reports", label: "보고서", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/textbooks", label: "교재 관리", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/admin/notices", label: "공지사항", icon: <Bell className="w-5 h-5" /> },
  { href: "/admin/chat", label: "학생 채팅", icon: <MessagesSquare className="w-5 h-5" /> },
  { href: "/admin/caretalk", label: "케어톡 (학부모)", icon: <MessageCircle className="w-5 h-5" /> },
];

const studentNav: NavItem[] = [
  { href: "/student", label: "홈", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/student/timer", label: "학습 타이머", icon: <Timer className="w-5 h-5" /> },
  { href: "/student/plan", label: "Daily Plan", icon: <ClipboardList className="w-5 h-5" /> },
  { href: "/student/stats", label: "학습 통계", icon: <BarChart2 className="w-5 h-5" /> },
  { href: "/student/notices", label: "공지사항", icon: <Bell className="w-5 h-5" /> },
  { href: "/student/chat", label: "관리자 채팅", icon: <MessagesSquare className="w-5 h-5" /> },
];

const parentNav: NavItem[] = [
  { href: "/parent", label: "자녀 현황", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/parent/reports", label: "학습 보고서", icon: <FileText className="w-5 h-5" /> },
  { href: "/parent/stats", label: "통계", icon: <BarChart2 className="w-5 h-5" /> },
  { href: "/parent/caretalk", label: "케어톡", icon: <MessageCircle className="w-5 h-5" /> },
];

interface SidebarProps {
  role: "admin" | "student" | "parent";
  userName?: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navItems = role === "admin" ? adminNav : role === "student" ? studentNav : parentNav;
  const roleLabel = role === "admin" ? "관리자" : role === "student" ? "학생" : "학부모";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-brand-100 min-h-screen flex-shrink-0">
      {/* 로고 */}
      <div className="p-5 border-b border-brand-100">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900 font-serif text-base font-semibold text-brand-50 flex-shrink-0">
            必
          </span>
          <div>
            <p className="text-xs font-semibold text-brand-800">구영민必학원</p>
            <p className="text-[11px] text-brand-400">독서실 관리</p>
          </div>
        </div>
      </div>

      {/* 사용자 정보 */}
      <div className="px-5 py-3 border-b border-brand-100">
        <p className="text-[10px] text-brand-400 uppercase tracking-wider">{roleLabel}</p>
        <p className="text-sm font-semibold text-brand-800 truncate">{userName ?? "사용자"}</p>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isChat = item.href.endsWith("/chat") || item.href.endsWith("/caretalk");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all",
                isActive
                  ? "bg-brand-700 text-white font-semibold"
                  : "text-brand-600 hover:bg-brand-50 hover:text-brand-900"
              )}
            >
              <div className={cn(isActive ? "text-white" : "text-brand-500")}>
                {item.icon}
              </div>
              <span className="flex-1 truncate">{item.label}</span>
              {isChat && !isActive && (
                <span className="text-[10px] bg-brand-100 text-brand-600 rounded-full px-1.5 py-0.5 flex-shrink-0">
                  대화
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 로그아웃 */}
      <div className="p-2.5 border-t border-brand-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-brand-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
