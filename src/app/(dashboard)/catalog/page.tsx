'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductsTab } from '@/components/catalog/ProductsTab';
import { CustomersTab } from '@/components/catalog/CustomersTab';
import { usePrefs, type CatalogTab } from '@/lib/prefs/usePrefs';
import { useUrlPrefSync } from '@/lib/prefs/useUrlPrefSync';

export default function CatalogPage() {
  const tab = usePrefs((s) => s.catalogTab);
  const patch = usePrefs((s) => s.patch);

  const { updateUrl } = useUrlPrefSync({
    tab: { key: 'catalogTab', parse: (v) => v as CatalogTab },
  });

  function setTab(t: CatalogTab) {
    patch({ catalogTab: t });
    updateUrl({ tab: t });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-7 pb-5 space-y-5 border-b border-border bg-background">
        <div className="space-y-0.5">
          <h2 className="font-heading font-semibold text-2xl text-foreground leading-tight">
            Danh mục
          </h2>
          <p className="text-xs text-muted-foreground">
            Quản lý sản phẩm và khách hàng dùng trong sổ doanh số
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as CatalogTab)}>
          <TabsList>
            <TabsTrigger value="products">Sản phẩm</TabsTrigger>
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 min-h-0 p-6 overflow-hidden">
        {tab === 'products' ? <ProductsTab /> : <CustomersTab />}
      </div>
    </div>
  );
}
