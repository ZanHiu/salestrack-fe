'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomers } from '@/hooks/useCustomers';
import { CustomerForm } from './CustomerForm';
import { EmptyState } from '@/components/EmptyState';
import type { Customer } from '@/types/domain';

export function CustomersTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useCustomers({ pageSize: 200 });
  const customers = data?.data ?? [];

  const filtered = useMemo(() => {
    if (!search) return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [customers, search]);

  const selected = customers.find((c) => c._id === selectedId) ?? null;

  function handleAdd() {
    setSelectedId(null);
    setIsNew(true);
  }

  function handleSelect(c: Customer) {
    setSelectedId(c._id);
    setIsNew(false);
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
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">Không có khách hàng</div>
          ) : (
            <ul>
              {filtered.map((c) => (
                <li key={c._id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm border-b border-border/50 hover:bg-secondary/40 transition-colors text-foreground',
                      selectedId === c._id && 'bg-primary/5 text-primary font-medium',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{c.name}</span>
                      {!c.isActive && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-sm">
                          ngừng KD
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border border-border rounded-md bg-card shadow-card p-5 overflow-auto">
        {!selected && !isNew ? (
          <EmptyState
            card={false}
            icon={
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
                <circle cx="28" cy="20" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M10 46c0-9 8-16 18-16s18 7 18 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            title="Chưa chọn khách hàng"
            description="Chọn từ danh sách bên trái hoặc bấm &quot;Thêm&quot;"
          />
        ) : (
          <CustomerForm
            customer={selected}
            isNew={isNew}
            onSaved={(c) => {
              setIsNew(false);
              setSelectedId(c._id);
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
