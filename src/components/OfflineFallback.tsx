'use client';

import { CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';

interface Props {
  /** Tên trang để hiển thị trong message, vd "báo cáo", "nhật ký" */
  pageName?: string;
}

export function OfflineFallback({ pageName }: Props) {
  const subject = pageName ?? 'trang này';

  return (
    <div className="h-full p-6">
      <EmptyState
        icon={<CloudOff size={56} strokeWidth={1.5} />}
        title="Bạn đang offline"
        description={`Cần kết nối mạng để xem ${subject}. Trang Nhập liệu vẫn dùng được offline — dữ liệu sẽ tự đồng bộ khi có mạng lại.`}
        action={
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw size={14} className="mr-1.5" />
            Thử lại
          </Button>
        }
      />
    </div>
  );
}
