export const CATEGORY_COLORS: Record<string, { dot: string; ring: string }> = {
  '1. TOBA XANH': { dot: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
  '2. HC': { dot: 'bg-amber-500', ring: 'ring-amber-500/20' },
  '3. SPRAY': { dot: 'bg-sky-500', ring: 'ring-sky-500/20' },
  '4. DƯỠNG RỄ': { dot: 'bg-green-700', ring: 'ring-green-700/20' },
  '5. TRUYỀN THỐNG': { dot: 'bg-amber-800', ring: 'ring-amber-800/20' },
  '6. BVTV': { dot: 'bg-red-600', ring: 'ring-red-600/20' },
  '7. KHÁC': { dot: 'bg-slate-500', ring: 'ring-slate-500/20' },
};

export function getCategoryDot(categoryName: string): string {
  return CATEGORY_COLORS[categoryName]?.dot ?? 'bg-slate-400';
}
