import { cn, formatMillion, formatPercent } from '@/lib/utils';

export type DisplayMode = 'completion-percent' | 'actual' | 'plan';

interface HeatmapCellProps {
  plan: number;
  actual: number;
  completionPercent: number | null;
  mode: DisplayMode;
}

function heatmapStyle(percent: number | null): string {
  if (percent === null) return 'text-muted-foreground';
  if (percent < 50) return 'bg-heat-low-bg text-heat-low-text';
  if (percent < 90) return 'bg-heat-mid-bg text-heat-mid-text';
  return 'bg-heat-high-bg text-heat-high-text';
}

export function HeatmapCell({ plan, actual, completionPercent, mode }: HeatmapCellProps) {
  if (mode === 'completion-percent') {
    return (
      <div
        className={cn(
          'h-9 px-2 flex items-center justify-end text-sm font-mono font-medium',
          heatmapStyle(completionPercent),
        )}
        title={`Plan: ${formatMillion(plan)} · Actual: ${formatMillion(actual)}`}
      >
        {formatPercent(completionPercent)}
      </div>
    );
  }

  const value = mode === 'plan' ? plan : actual;
  return (
    <div
      className={cn(
        'h-9 px-2 flex items-center justify-end text-sm font-mono',
        value === 0 ? 'text-muted-foreground' : 'text-foreground',
      )}
    >
      {value === 0 ? '—' : formatMillion(value)}
    </div>
  );
}
