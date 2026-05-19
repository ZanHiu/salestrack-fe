'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomers } from '@/hooks/useCustomers';
import { CustomerForm } from './CustomerForm';
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
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-center text-slate-500">Không có khách hàng</div>
          ) : (
            <ul>
              {filtered.map((c) => (
                <li key={c._id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm border-b hover:bg-slate-50 transition-colors',
                      selectedId === c._id && 'bg-blue-50 text-blue-900 font-medium',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{c.name}</span>
                      {!c.isActive && (
                        <span className="text-xs text-slate-400 ml-2">ngừng KD</span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border rounded-lg bg-white p-4 overflow-auto">
        {!selected && !isNew ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            Chọn khách hàng hoặc &quot;Thêm&quot; để bắt đầu
          </div>
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
