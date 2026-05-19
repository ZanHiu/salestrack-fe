'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProductsTab } from '@/components/catalog/ProductsTab';
import { CustomersTab } from '@/components/catalog/CustomersTab';

export default function CatalogPage() {
  const [tab, setTab] = useState<'products' | 'customers'>('products');

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-4 space-y-4 border-b bg-white">
        <h2 className="text-xl font-semibold">Danh mục</h2>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="products">Sản phẩm</TabsTrigger>
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 min-h-0 p-6 overflow-hidden">
        <Tabs value={tab} className="h-full">
          <TabsContent value="products" className="mt-0 h-full">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="customers" className="mt-0 h-full">
            <CustomersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
