// Color palette indexed by categoryOrder.
// Order 1-7 match the original 7 nhóm. Orders 8+ wrap to additional colors.
const PALETTE = [
  'bg-emerald-500', // 1. TOBA XANH
  'bg-amber-500', // 2. HC
  'bg-sky-500', // 3. SPRAY
  'bg-green-700', // 4. DƯỠNG RỄ
  'bg-amber-800', // 5. TRUYỀN THỐNG
  'bg-red-600', // 6. BVTV
  'bg-slate-500', // 7. KHÁC
  'bg-violet-500', // 8
  'bg-pink-500', // 9
  'bg-cyan-500', // 10
  'bg-fuchsia-500', // 11
  'bg-lime-600', // 12
];

export function getCategoryDot(categoryOrder: number): string {
  if (!Number.isFinite(categoryOrder) || categoryOrder < 1) return 'bg-slate-400';
  return PALETTE[(categoryOrder - 1) % PALETTE.length];
}
