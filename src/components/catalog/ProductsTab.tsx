'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProducts } from '@/hooks/useProducts';
import { productsApi } from '@/lib/api/products';
import { getApiErrorMessage } from '@/lib/api/client';
import { getCategoryDot } from '@/lib/category-colors';
import { ProductForm } from './ProductForm';
import {
  RenameCategoryDialog,
  ConfirmDeleteCategoryDialog,
} from './CategoryActions';
import { EmptyState } from '@/components/EmptyState';
import { useIsAdmin } from '@/lib/auth/permissions';
import type { Product } from '@/types/domain';

interface Group {
  categoryName: string;
  categoryOrder: number;
  rows: Product[];
}

export function ProductsTab() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');
  const [renameTarget, setRenameTarget] = useState<Group | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);
  const isAdmin = useIsAdmin();

  const { data, isLoading } = useProducts({});
  const products = data?.data ?? [];

  // Deep-link select from /audit
  useEffect(() => {
    const sel = searchParams.get('select');
    if (!sel || products.length === 0) return;
    const exists = products.some((p) => p._id === sel);
    if (exists) {
      setSelectedId(sel);
      setIsNew(false);
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete('select');
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  const filtered = useMemo(() => {
    if (!search) return products;
    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const grouped = useMemo<Group[]>(() => {
    const result: Group[] = [];
    for (const p of filtered) {
      const last = result[result.length - 1];
      if (last && last.categoryName === p.categoryName) last.rows.push(p);
      else
        result.push({
          categoryName: p.categoryName,
          categoryOrder: p.categoryOrder,
          rows: [p],
        });
    }
    return result;
  }, [filtered]);

  const selected = products.find((p) => p._id === selectedId) ?? null;

  function handleAdd() {
    setSelectedId(null);
    setIsNew(true);
  }

  async function handleRename(newName: string, newOrder: number) {
    if (!renameTarget) return;
    try {
      await productsApi.renameCategory(renameTarget.categoryName, newName, newOrder);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã đổi tên nhóm');
      setRenameTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleDeleteCategory() {
    if (!deleteTarget) return;
    try {
      await productsApi.deleteCategory(deleteTarget.categoryName);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã xóa nhóm');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="grid grid-cols-[1fr_1.2fr] gap-4 h-full">
      <div className="border border-border rounded-md bg-card shadow-card flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Danh sách ({filtered.length})
            </h3>
            {isAdmin && (
              <Button size="sm" onClick={handleAdd}>
                <Plus size={14} className="mr-1.5" /> Thêm
              </Button>
            )}
          </div>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
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
            <div className="p-4 text-sm text-center text-muted-foreground">
              Đang tải...
            </div>
          ) : (
            grouped.map((g) => (
              <div key={g.categoryName}>
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/60 border-y border-border">
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        getCategoryDot(g.categoryOrder),
                      )}
                    />
                    <span className="truncate">{g.categoryName}</span>
                  </span>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Tùy chọn nhóm"
                      >
                        <MoreVertical size={14} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onSelect={() => setRenameTarget(g)}>
                          <Pencil size={14} className="mr-2" />
                          Đổi tên nhóm
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setDeleteTarget(g)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Xóa nhóm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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
          <EmptyState
            card={false}
            icon={
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                aria-hidden="true"
              >
                <rect x="8" y="14" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="22" x2="48" y2="22" stroke="currentColor" strokeWidth="2" />
                <circle cx="14" cy="18" r="1.2" fill="currentColor" />
                <circle cx="18" cy="18" r="1.2" fill="currentColor" />
              </svg>
            }
            title="Chưa chọn sản phẩm"
            description="Chọn từ danh sách bên trái hoặc bấm &quot;Thêm&quot;"
          />
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

      <RenameCategoryDialog
        target={renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        onConfirm={handleRename}
      />
      <ConfirmDeleteCategoryDialog
        target={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
}
