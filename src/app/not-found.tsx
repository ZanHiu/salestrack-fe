import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-slate-300">404</div>
        <h1 className="text-xl font-semibold">Không tìm thấy trang</h1>
        <p className="text-sm text-slate-500">Liên kết không tồn tại hoặc đã bị xóa</p>
        <Button asChild>
          <Link href="/entries">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
