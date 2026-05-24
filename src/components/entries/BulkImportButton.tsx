'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { salesEntriesApi } from '@/lib/api/salesEntries';
import { getApiErrorMessage } from '@/lib/api/client';

interface Props {
  defaultYear: number;
}

export function BulkImportButton({ defaultYear }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(String(defaultYear));
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    failed: number;
    errors: { row: number; reason: string }[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const res = await salesEntriesApi.bulkImport(file, Number(year));
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast.success(`Đã import ${res.imported} dòng, ${res.failed} lỗi`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload size={14} className="mr-1.5" /> Nhập từ Excel
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import dữ liệu từ Excel</DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="year">Năm</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="file">File .xlsx</Label>
              <Input
                ref={inputRef}
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                File cần có sheet tên &quot;KHACH HANG&quot;
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Đã import</span>
              <span className="font-semibold text-green-600">{result.imported}</span>
            </div>
            <div className="flex justify-between">
              <span>Lỗi</span>
              <span className="font-semibold text-red-600">{result.failed}</span>
            </div>
            {result.errors.length > 0 && (
              <details className="text-xs mt-2">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Chi tiết lỗi
                </summary>
                <ul className="mt-1 max-h-40 overflow-auto bg-secondary rounded p-2">
                  {result.errors.slice(0, 50).map((e, i) => (
                    <li key={i}>Row {e.row}: {e.reason}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="outline" onClick={handleClose}>Hủy</Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading || !year}
              >
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Đóng</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
