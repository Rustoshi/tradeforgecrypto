import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("border-border-default bg-surface", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-secondary">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-text-muted" />}
      </CardHeader>
      <CardContent>
        <div className="text-lg sm:text-2xl font-bold text-text-primary truncate">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-1 text-xs text-text-muted">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive ? "text-success" : "text-error"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
