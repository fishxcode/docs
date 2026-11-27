import type { ComponentProps } from 'react';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { MDXComponents } from 'mdx/types';
import { ModelCatalog } from '@/components/model-catalog-lazy';
import { ClientGuide } from '@/components/client-guide';
import { GroupCount, GroupRatioTable, LiveRatio, RatioExampleTable } from '@/components/group-ratio-table';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // 文档以截图为主，点击可放大查看（旧文档站用 medium-zoom 提供同样的能力）
    img: (props: ComponentProps<'img'>) => (
      <ImageZoom {...(props as ComponentProps<typeof ImageZoom>)} />
    ),
    Accordion,
    Accordions,
    ModelCatalog,
    ClientGuide,
    // 分组倍率表：构建时渲染基线、水合后从 /api/pricing 拉实时值（见 group-ratio-table.tsx）
    GroupRatioTable,
    RatioExampleTable,
    LiveRatio,
    GroupCount,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
