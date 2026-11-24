'use client';

import dynamic from 'next/dynamic';

/**
 * 模型目录只出现在「支持的模型」页：按需加载，不进其余文档页共用的客户端包。
 * 数据本来就在浏览器端实时请求，服务端预渲染没有意义（ssr: false）；
 * 脚本加载期间先占住大致高度，避免页面跳动。
 */
const LazyModelCatalog = dynamic(() => import('./model-catalog').then((module) => module.ModelCatalog), {
  ssr: false,
  loading: () => <div aria-hidden className="not-prose my-6 h-64 animate-pulse rounded-xl border bg-fd-card" />,
});

/** MDX 组件表要求函数组件，dynamic() 的返回类型还包含类组件，这里包一层 */
export function ModelCatalog() {
  return <LazyModelCatalog />;
}
