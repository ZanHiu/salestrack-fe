'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/useProducts';
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
      <div className="border rounded-lg bg-white flex flex-col overflow-hidden">
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Danh sách ({filtered.length})</h3>
            <Button size="sm" onClick={handleAdd}>
              <Plus size={14} className="mr-1.5" /> Thêm
            </Button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
            <div className="p-4 text-sm text-center text-slate-500">Đang tải...</div>
          ) : (
            grouped.map((g) => (
              <div key={g.categoryName}>
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase bg-slate-50 border-b">
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
                          'w-full text-left px-3 py-2 text-sm border-b hover:bg-slate-50 transition-colors',
                          selectedId === p._id && 'bg-blue-50 text-blue-900 font-medium',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{p.name}</span>
                          {!p.isActive && (
                            <span className="text-xs text-slate-400 ml-2">ngừng KD</span>
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

      <div className="border rounded-lg bg-white p-4 overflow-auto">
        {!selected && !isNew ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            Chọn sản phẩm hoặc &quot;Thêm&quot; để bắt đầu
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
