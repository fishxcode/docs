import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // 静态导出只在构建时启用：next build 的 NODE_ENV 恒为 production。
  // next dev 若也处于 export 模式，访问未枚举路径（甚至 /favicon.ico）会被
  // dev server 无条件抛错（Next 硬编码行为），dev 体验极差且无法关闭；
  // 非 export 的 dev 下，未枚举路径正常渲染 not-found 页。
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  // 部署目标（Cloudflare Pages 与 Vercel）直接托管静态文件，不走 Next 的图片优化管线
  images: {
    unoptimized: true,
  },
  // takumi 的原生渲染核心不在打包边界内，交给 Node 直接加载
  serverExternalPackages: ['@takumi-rs/core'],
};

export default withMDX(config);
