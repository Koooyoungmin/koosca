import { cn } from "@/lib/utils";

type Status = "study" | "outing" | "sleep" | "away";

const statusConfig: Record<Status, { label: string; className: string; dot: string }> = {
  study: {
    label: "학습 중",
    className: "bg-status-study/10 text-status-study border border-status-study/20",
    dot: "bg-status-study animate-pulse",
  },
  outing: {
    label: "외출 중",
    className: "bg-status-outing/10 text-status-outing border border-status-outing/20",
    dot: "bg-status-outing",
  },
  sleep: {
    label: "수면 중",
    className: "bg-status-sleep/10 text-status-sleep border border-status-sleep/20",
    dot: "bg-status-sleep",
  },
  away: {
    label: "하원",
    className: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
