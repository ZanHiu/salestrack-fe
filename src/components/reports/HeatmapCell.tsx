import { cn, formatMillion, formatPercent } from '@/lib/utils';

export type DisplayMode = 'completion-percent' | 'actual' | 'plan';

interface HeatmapCellProps {
  plan: number;
  actual: number;
  completionPercent: number | null;
  mode: DisplayMode;
}

function heatmapStyle(percent: number | null): string {
  if (percent === null) return 'text-slate-400';
  if (percent < 50) return 'bg-red-100 text-red-900';
  if (percent < 90) return 'bg-amber-100 text-amber-900';
  return 'bg-green-100 text-green-900';
}

export function HeatmapCell({ plan, actual, completionPercent, mode }: HeatmapCellProps) {
  if (mode === 'completion-percent') {
    return (
      <div
        className={cn(
          'h-9 px-2 flex items-center justify-end text-sm font-medium tabular-nums',
          heatmapStyle(completionPercent),
        )}
      >
        {formatPercent(completionPercent)}
      </div>
    );
  }

  const value = mode === 'plan' ? plan : actual;
  return (
    <div
      className={cn(
        'h-9 px-2 flex items-center justify-end text-sm tabular-nums',
        value === 0 ? 'text-slate-400' : 'text-slate-900',
      )}
    >
      {value === 0 ? '—' : formatMillion(value)}
    </div>
  );
}
