export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'staff';
}

export interface Customer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  categoryName: string;
  categoryOrder: number;
  unit?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  order: number;
  name: string;
  productCount: number;
}

export interface SalesEntry {
  id: string;
  year: number;
  month: number;
  customerId: string;
  productId: string;
  customer: { id: string; name: string };
  product: {
    id: string;
    name: string;
    categoryName: string;
    categoryOrder: number;
    unit?: string;
  };
  planAmount: number;
  actualAmount: number;
  unitPrice?: number;
  quantity?: number;
  note?: string;
  updatedAt: string;
}

export interface ReportMonthCell {
  month: number;
  plan: number;
  actual: number;
  completionPercent: number | null;
}

export interface ReportRowProduct {
  product: { id: string; name: string; categoryName: string; categoryOrder: number; unit?: string };
  months: ReportMonthCell[];
  yearTotal: { plan: number; actual: number; completionPercent: number | null };
}

export interface ReportRowCustomer {
  customer: { id: string; name: string };
  months: ReportMonthCell[];
  yearTotal: { plan: number; actual: number; completionPercent: number | null };
}

export interface ReportData<TRow> {
  year: number;
  rows: TRow[];
  grandTotal: { plan: number; actual: number; completionPercent: number | null };
}

export type ProductReport = ReportData<ReportRowProduct>;
export type CustomerReport = ReportData<ReportRowCustomer>;
