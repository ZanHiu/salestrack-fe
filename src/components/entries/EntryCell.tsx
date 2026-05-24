'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Settings } from 'lucide-react';
import { cn, formatMillion, formatPercent } from '@/lib/utils';
import type { PivotCell } from '@/hooks/useSalesEntries';

export type ViewMode = 'plan' | 'actual' | 'compare';

interface EntryCellProps {
  cell: PivotCell | undefined;
  viewMode: ViewMode;
  isFocused: boolean;
  isSaving: boolean;
  justSaved: boolean;
  onFocus: () => void;
  onCommit: (newValue: number) => void;
  onCancel: () => void;
  onKey: (key: 'Enter' | 'Tab' | 'ShiftTab' | 'ArrowUp' | 'ArrowDown') => void;
  onOpenDetail?: () => void;
}

function heatmapClass(percent: number | null): string {
  if (percent === null) return 'text-muted-foreground';
  if (percent < 50) return 'bg-heat-low-bg text-heat-low-text';
  if (percent < 90) return 'bg-heat-mid-bg text-heat-mid-text';
  return 'bg-heat-high-bg text-heat-high-text';
}

export function EntryCell({
  cell,
  viewMode,
  isFocused,
  isSaving,
  justSaved,
  onFocus,
  onCommit,
  onCancel,
  onKey,
  onOpenDetail,
}: EntryCellProps) {
  const plan = cell?.plan ?? 0;
  const actual = cell?.actual ?? 0;
  const value = viewMode === 'plan' ? plan : actual;
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string>('');

  useEffect(() => {
    if (isFocused) {
      setDraft(value === 0 ? '' : String(value));
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isFocused, value]);

  function commit() {
    const n = draft === '' ? 0 : parseFloat(draft.replace(/,/g, '.'));
    if (Number.isFinite(n) && n !== value) {
      onCommit(Math.max(0, n));
    } else {
      onCancel();
    }
  }

  if (viewMode === 'compare') {
    const percent = plan === 0 ? null : Math.round((actual / plan) * 100);
    return (
      <div
        className={cn(
          'h-9 px-2 flex items-center justify-end text-sm font-medium font-mono',
          heatmapClass(percent),
        )}
      >
        {formatPercent(percent)}
      </div>
    );
  }

  if (!isFocused) {
    const display = value === 0 ? '—' : formatMillion(value);
    return (
      <button
        type="button"
        onClick={onFocus}
        className={cn(
          'h-9 w-full px-2 text-right text-sm font-mono group-hover/row:bg-secondary/40 group-hover/col:bg-secondary/40 hover:!bg-primary/5 focus:!bg-primary/5 focus:outline-none transition-colors',
          value === 0 ? 'text-muted-foreground' : 'text-foreground',
          justSaved && 'animate-save-flash',
        )}
      >
        {display}
      </button>
    );
  }

  return (
    <div className="relative h-9 flex items-center">
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
            onKey('Enter');
          } else if (e.key === 'Tab') {
            e.preventDefault();
            commit();
            onKey(e.shiftKey ? 'ShiftTab' : 'Tab');
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            commit();
            onKey('ArrowUp');
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            commit();
            onKey('ArrowDown');
          }
        }}
        className="w-full h-full px-2 pr-7 text-right text-sm font-mono bg-primary/5 border-2 border-primary rounded-sm focus:outline-none"
      />
      {onOpenDetail && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onOpenDetail();
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Thêm giá & số lượng"
        >
          <Settings size={12} />
        </button>
      )}
      {isSaving && (
        <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-primary" />
      )}
    </div>
  );
}
