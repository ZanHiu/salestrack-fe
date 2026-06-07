'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EntriesViewMode = 'plan' | 'actual' | 'compare';
export type ReportsType = 'by-product' | 'by-customer';
export type ReportsDisplayMode = 'actual' | 'plan' | 'completion-percent';
export type CatalogTab = 'products' | 'customers';

interface PrefsState {
  // Shared
  year: number;

  // /entries
  entriesCustomerId: string | null;
  entriesCategoryFilter: string | null;
  entriesViewMode: EntriesViewMode;

  // /reports
  reportsType: ReportsType;
  reportsDisplayMode: ReportsDisplayMode;

  // /catalog
  catalogTab: CatalogTab;

  // Layout
  sidebarCollapsed: boolean;

  // Generic patcher
  patch: (p: Partial<Omit<PrefsState, 'patch'>>) => void;
}

const DEFAULT_YEAR = 2024;

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      year: DEFAULT_YEAR,
      entriesCustomerId: null,
      entriesCategoryFilter: null,
      entriesViewMode: 'actual',
      reportsType: 'by-customer',
      reportsDisplayMode: 'actual',
      catalogTab: 'products',
      sidebarCollapsed: false,
      patch: (p) => set(p),
    }),
    {
      name: 'salestrack-prefs',
      version: 1,
    },
  ),
);
