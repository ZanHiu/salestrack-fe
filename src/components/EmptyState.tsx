import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** When true, wrap in card surface. When false, render inline. Default: true. */
  card?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  card = true,
  className,
}: EmptyStateProps) {
  const inner = (
    <>
      <div className="text-primary/30">{icon}</div>
      <div className="text-center space-y-1 max-w-sm">
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </>
  );

  if (!card) {
    return (
      <div
        className={cn(
          'h-full flex flex-col items-center justify-center gap-3 p-8',
          className,
        )}
      >
        {inner}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-md h-full flex flex-col items-center justify-center gap-3 shadow-card p-8',
        className,
      )}
    >
      {inner}
    </div>
  );
}
