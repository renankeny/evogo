import React from "react";
import { cn } from "@/utils/cn";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "default" | "full" | "narrow";
}

export function PageContainer({
  children,
  className,
  maxWidth = "default",
  ...props
}: PageContainerProps) {
  const maxClass =
    maxWidth === "narrow"
      ? "max-w-4xl"
      : maxWidth === "full"
      ? "max-w-full"
      : "max-w-7xl";

  return (
    <div
      className={cn(
        "w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in-50 duration-200",
        maxClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/40",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-gray-100">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground dark:text-gray-400">{description}</p>
        )}
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
