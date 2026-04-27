import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    study: "학습 중",
    outing: "외출 중",
    sleep: "수면 중",
    away: "하원",
  };
  return map[status] ?? status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    study: "bg-status-study text-white",
    outing: "bg-status-outing text-white",
    sleep: "bg-status-sleep text-white",
    away: "bg-status-away text-white",
  };
  return map[status] ?? "bg-gray-200 text-gray-700";
}
