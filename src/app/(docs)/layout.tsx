import type { ReactNode } from 'react';
import { LocalizedDocsLayout } from '@/components/localized-docs-layout';

export default function Layout({ children }: { children: ReactNode }) {
  // 根分组承载默认语言 zh：URL 无前缀，语言上下文由根布局提供（zh），
  // 这里复用共享外壳，仅为保持两组文档布局一致
  return <LocalizedDocsLayout lang="zh">{children}</LocalizedDocsLayout>;
}
