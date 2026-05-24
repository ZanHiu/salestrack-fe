'use client';

import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCustomers } from '@/hooks/useCustomers';
import { useCategories } from '@/hooks/useProducts';
import { getYearOptions } from '@/lib/constants';

interface FiltersProps {
  year: number;
  onYearChange: (y: number) => void;
  customerId: string | null;
  onCustomerChange: (id: string) => void;
  categoryFilter: string | null;
  onCategoryChange: (cat: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function EntriesFilters({
  year,
  onYearChange,
  customerId,
  onCustomerChange,
  categoryFilter,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: FiltersProps) {
  const { data: customersData } = useCustomers({ isActive: true, pageSize: 200 });
  const { data: categories } = useCategories();

  const customers = customersData?.data ?? [];
  const yearOptions = getYearOptions();

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-[100px]">
        <label className="text-xs text-muted-foreground mb-1 block font-medium">Năm</label>
        <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[240px]">
        <label className="text-xs text-muted-foreground mb-1 block font-medium">
          Khách hàng <span className="text-brand-orange">*</span>
        </label>
        <Select value={customerId ?? ''} onValueChange={onCustomerChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn khách hàng..." />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[200px]">
        <label className="text-xs text-muted-foreground mb-1 block font-medium">
          Nhóm sản phẩm
        </label>
        <Select
          value={categoryFilter ?? '__all__'}
          onValueChange={(v) => onCategoryChange(v === '__all__' ? null : v)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.order} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[220px]">
        <label className="text-xs text-muted-foreground mb-1 block font-medium">
          Tìm sản phẩm
        </label>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
    </div>
  );
}
