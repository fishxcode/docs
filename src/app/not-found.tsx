import Link from '@/components/app-link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6 py-24 text-center">
      <h1 className="text-6xl font-bold text-fd-muted-foreground">404</h1>
      <p className="text-lg text-fd-muted-foreground">
        页面不存在 · Page not found
      </p>
      <Link
        href="/"
        className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
      >
        返回首页 / Back to Home
      </Link>
    </div>
  );
}
