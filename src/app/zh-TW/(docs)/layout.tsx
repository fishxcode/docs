import type { ReactNode } from 'react';
import { LocalizedDocsLayout } from '@/components/localized-docs-layout';

export default function Layout({ children }: { children: ReactNode }) {
  return <LocalizedDocsLayout lang="zh-TW">{children}</LocalizedDocsLayout>;
}
