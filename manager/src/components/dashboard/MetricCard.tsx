import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

export interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  pulse?: boolean;
}

export function MetricCard({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  pulse = false,
}: MetricCardProps) {
  return (
    <Card id={id} className="relative overflow-hidden border-border bg-card shadow-xs transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="relative">
            <Icon className={cn("h-5 w-5", iconColor)} />
            {pulse && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
        </div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
