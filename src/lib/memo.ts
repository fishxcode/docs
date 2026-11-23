/**
 * 只在当前 Node 进程内复用 Promise 的极简缓存。
 *
 * 用途：SSR 运行时同一进程反复渲染 OG 图时，字体下载只发生一次；
 * 每个 key 独立缓存，失败结果不缓存（下次重试）。
 */
export function createMemo<T>() {
  const entries = new Map<string, Promise<T>>();

  return (key: string, load: () => Promise<T>): Promise<T> => {
    const existing = entries.get(key);
    if (existing) return existing;

    // 先登记再执行，使并发请求和同步抛错走同一套复用、失败清理逻辑。
    const pending = Promise.resolve().then(load).catch((error: unknown) => {
      if (entries.get(key) === pending) entries.delete(key);
      throw error;
    });
    entries.set(key, pending);
    return pending;
  };
}
