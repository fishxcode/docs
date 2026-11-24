/**
 * 自毁版 Service Worker——本站自身不注册任何 Service Worker，这个文件只为清理旧站留下的那个。
 *
 * 旧文档站（VitePress + vite-plugin-pwa）在同一域名注册过 /sw.js，并预缓存了全部页面。
 * 域名切到本站后，老访客的浏览器仍会由旧 Service Worker 从缓存返回旧页面；
 * 浏览器在导航时检查 /sw.js 是否更新，拿到这份内容不同的脚本后：
 *   安装即接管（skipWaiting）→ 删除本域名下全部 Cache Storage → 注销自身 → 刷新它控制的页面，
 * 此后的访问直接走网络，看到的就是本站。
 *
 * 不监听 fetch：这个 Worker 存在的时间只有一次激活，请求照常走网络即可。
 * 响应头见 public/_headers（禁止缓存），路由见 public/_routes.json（不经过边缘 Worker）。
 */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      await self.registration.unregister();

      // 激活后，原先由旧 Worker 控制的页面已转由本 Worker 控制，刷新它们以脱离缓存
      const windows = await self.clients.matchAll({ type: 'window' });
      await Promise.all(windows.map((client) => client.navigate(client.url).catch(() => undefined)));
    })(),
  );
});
