'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { reportsApi } from '@/lib/api/reports';
import { getApiErrorMessage } from '@/lib/api/client';

interface Props {
  year: number;
  type: 'by-product' | 'by-customer';
}

export function ExportExcelButton({ year, type }: Props) {
  const [downloading, setDownloading] = useState(false);

  async function handleExport() {
    setDownloading(true);
    try {
      await reportsApi.exportExcel(year, type);
      toast.success('Đã xuất file');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={downloading}>
      {downloading ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <Download size={14} className="mr-1.5" />
      )}
      Xuất Excel
    </Button>
  );
}
