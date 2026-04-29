"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  Timer,
  ClipboardList,
  BarChart2,
  MessageCircle,
  MessagesSquare,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/students", label: "학생", icon: Users },
  { href: "/admin/chat", label: "학생채팅", icon: MessagesSquare },
  { href: "/admin/caretalk", label: "케어톡", icon: MessageCircle },
  { href: "/admin/notices", label: "공지", icon: Bell },
];

const studentNav = [
  { href: "/student", label: "홈", icon: LayoutDashboard },
  { href: "/student/timer", label: "타이머", icon: Timer },
  { href: "/student/plan", label: "플랜", icon: ClipboardList },
  { href: "/student/stats", label: "통계", icon: BarChart2 },
  { href: "/student/chat", label: "채팅", icon: MessagesSquare },
];

const parentNav = [
  { href: "/parent", label: "현황", icon: LayoutDashboard },
  { href: "/parent/reports", label: "보고서", icon: FileText },
  { href: "/parent/stats", label: "통계", icon: BarChart2 },
  { href: "/parent/caretalk", label: "케어톡", icon: MessageCircle },
];

interface BottomNavProps {
  role: "admin" | "student" | "parent";
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const navItems =
    role === "admin" ? adminNav : role === "student" ? studentNav : parentNav;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-100 z-50">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive ? "text-brand-600 font-bold" : "text-brand-400"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-brand-600")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
