import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="font-heading font-bold text-7xl text-primary/20 leading-none">
          404
        </div>
        <div className="space-y-2">
          <h1 className="font-heading font-semibold text-xl text-foreground">
            Không tìm thấy trang
          </h1>
          <p className="text-sm text-muted-foreground">
            Liên kết không tồn tại hoặc đã bị xóa
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
