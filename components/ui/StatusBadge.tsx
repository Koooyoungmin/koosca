import { cn } from "@/lib/utils";

type Status = "study" | "outing" | "sleep" | "away";

const statusConfig: Record<Status, { label: string; className: string; dot: string }> = {
  study: {
    label: "학습 중",
    className: "bg-brand-50 text-brand-500 border-brand-100",
    dot: "bg-brand-500 animate-pulse",
  },
  outing: {
    label: "외출 중",
    className: "bg-amber-50 text-amber-600 border-amber-100",
    dot: "bg-amber-500",
  },
  sleep: {
    label: "수면 중",
    className: "bg-slate-50 text-slate-500 border-slate-100",
    dot: "bg-slate-400",
  },
  away: {
    label: "하원",
    className: "bg-red-50 text-red-500 border-red-100",
    dot: "bg-red-400",
  },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.away;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border",
        config.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
