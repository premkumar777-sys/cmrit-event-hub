import { cn } from "@/lib/utils";

type StatusType = "draft" | "pending" | "approved" | "rejected" | "completed" | "ongoing";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-status-draft text-status-draft-foreground",
  },
  pending: {
    label: "Pending",
    className: "bg-status-pending/15 text-status-pending-foreground border border-status-pending/30",
  },
  approved: {
    label: "Approved",
    className: "bg-status-approved text-status-approved-foreground",
  },
  rejected: {
    label: "Rejected",
    className: "bg-status-rejected text-status-rejected-foreground",
  },
  completed: {
    label: "Completed",
    className: "bg-status-completed text-status-completed-foreground",
  },
  ongoing: {
    label: "Ongoing",
    className: "bg-blue-500 text-white",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
