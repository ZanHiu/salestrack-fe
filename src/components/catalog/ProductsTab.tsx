'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/useProducts';
import { getCategoryDot } from '@/lib/category-colors';
import { ProductForm } from './ProductForm';
import type { Product } from '@/types/domain';

export function ProductsTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useProducts({});
  const products = data?.data ?? [];

  const filtered = useMemo(() => {
    if (!search) return products;
    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const grouped = useMemo(() => {
    const result: { categoryName: string; rows: Product[] }[] = [];
    for (const p of filtered) {
      const last = result[result.length - 1];
      if (last && last.categoryName === p.categoryName) last.rows.push(p);
      else result.push({ categoryName: p.categoryName, rows: [p] });
    }
    return result;
  }, [filtered]);

  const selected = products.find((p) => p._id === selectedId) ?? null;

  function handleAdd() {
    setSelectedId(null);
    setIsNew(true);
  }

  return (
    <div className="grid grid-cols-[1fr_1.2fr] gap-4 h-full">
      <div className="border border-border rounded-md bg-card shadow-card flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Danh sách ({filtered.length})
            </h3>
            <Button size="sm" onClick={handleAdd}>
              <Plus size={14} className="mr-1.5" /> Thêm
            </Button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-center text-muted-foreground">Đang tải...</div>
          ) : (
            grouped.map((g) => (
              <div key={g.categoryName}>
                <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/60 border-y border-border">
                  <span className={cn('w-2 h-2 rounded-full', getCategoryDot(g.categoryName))} />
                  {g.categoryName}
                </div>
                <ul>
                  {g.rows.map((p) => (
                    <li key={p._id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(p._id);
                          setIsNew(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm border-b border-border/50 hover:bg-secondary/40 transition-colors text-foreground',
                          selectedId === p._id && 'bg-primary/5 text-primary font-medium',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{p.name}</span>
                          {!p.isActive && (
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-sm">
                              ngừng KD
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border border-border rounded-md bg-card shadow-card p-5 overflow-auto">
        {!selected && !isNew ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              className="text-primary/30"
              aria-hidden="true"
            >
              <rect x="8" y="14" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
              <line x1="8" y1="22" x2="48" y2="22" stroke="currentColor" strokeWidth="2" />
              <circle cx="14" cy="18" r="1.2" fill="currentColor" />
              <circle cx="18" cy="18" r="1.2" fill="currentColor" />
            </svg>
            <div className="text-center space-y-0.5">
              <p className="text-sm font-medium text-foreground">Chưa chọn sản phẩm</p>
              <p className="text-xs text-muted-foreground">
                Chọn từ danh sách bên trái hoặc bấm &quot;Thêm&quot;
              </p>
            </div>
          </div>
        ) : (
          <ProductForm
            product={selected}
            isNew={isNew}
            onSaved={(p) => {
              setIsNew(false);
              setSelectedId(p._id);
            }}
            onCancelled={() => {
              setIsNew(false);
              setSelectedId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
