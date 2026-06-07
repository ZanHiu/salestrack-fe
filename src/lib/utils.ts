import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMillion(value: number): string {
  if (!value) return '—';
  return value.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
}

/**
 * Format an amount stored in millions of VND. Returns the numeric string and
 * its unit ("triệu VNĐ" or "tỷ VNĐ") separately so callers can render them
 * without producing combined units like "5 tỷ triệu VNĐ".
 */
export function formatAmountVN(million: number): { value: string; unit: string } {
  if (!million) return { value: '0', unit: 'triệu VNĐ' };
  if (Math.abs(million) >= 1000) {
    return {
      value: (million / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }),
      unit: 'tỷ VNĐ',
    };
  }
  return {
    value: million.toLocaleString('vi-VN', { maximumFractionDigits: 1 }),
    unit: 'triệu VNĐ',
  };
}

export function formatVND(value: number): string {
  return value.toLocaleString('vi-VN');
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value)}%`;
}

export function parseNumberInput(value: string): number {
  const cleaned = value.replace(/[,.\s]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
