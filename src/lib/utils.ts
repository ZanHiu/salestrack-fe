import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMillion(value: number): string {
  if (!value) return '—';
  return value.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
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
