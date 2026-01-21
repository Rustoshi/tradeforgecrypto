import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType =
  | "pending"
  | "approved"
  | "declined"
  | "active"
  | "completed"
  | "cancelled"
  | "suspended"
  | "blocked";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  declined: "bg-error/10 text-error border-error/20",
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-info/10 text-info border-info/20",
  cancelled: "bg-error/10 text-error border-error/20",
  suspended: "bg-warning/10 text-warning border-warning/20",
  blocked: "bg-error/10 text-error border-error/20",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as StatusType;
  const styles = statusStyles[normalizedStatus] || "bg-surface-muted text-text-muted";

  return (
    <Badge
      variant="outline"
      className={cn("border font-medium capitalize", styles, className)}
    >
      {status.toLowerCase()}
    </Badge>
  );
}
