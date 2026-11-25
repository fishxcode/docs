import { DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import {
  FamilyStatusClient,
  ModelDetailClient,
  StatusOverviewClient,
} from '@/components/status/status-pages';
import { statusFamilyLabel } from '@/lib/status-copy';
import { statusMetadata } from '@/lib/status-metadata';
import { FAMILY_ORDER, isFamily, type Family } from '@/lib/status';
import statusModels from '@/lib/status-models.json';
import type { Locale } from '@/lib/i18n';

/**
 * 各语言状态页的路由工厂（与 localized-doc-page / localized-home-page 同一模式）。
 *
 * 语言目录是静态段（src/app/{lang}/(docs)/status/...），路由文件只做薄壳转发。
 * 三套页面都用真实内容而不是文档回退页，所以每种语言都生成完整路由与 hreflang。
 */
export function createLocalizedStatusPages(lang: Locale) {
  return {
    overview: {
      generateMetadata() {
        return statusMetadata(
          lang,
          ['status'],
          '模型状态监控',
          '查看 FishXCode 在测模型的可用性、响应延迟、端点 PING、价格与真实调用性能。',
        );
      },
      Page() {
        return (
          <DocsPage full>
            <StatusOverviewClient />
          </DocsPage>
        );
      },
    },

    family: {
      generateStaticParams(): Array<{ fam: Family }> {
        return FAMILY_ORDER.map((fam) => ({ fam }));
      },
      async generateMetadata(props: { params: Promise<{ fam: string }> }) {
        const { fam } = await props.params;
        if (!isFamily(fam)) return {};
        const vars = { label: statusFamilyLabel(lang, fam) };
        return statusMetadata(
          lang,
          ['status', fam],
          '{label} 模型状态',
          '{label}系列在测模型的可用性、响应延迟、巡检心跳与端点 PING。',
          vars,
        );
      },
      async Page(props: { params: Promise<{ fam: string }> }) {
        const { fam } = await props.params;
        if (!isFamily(fam)) notFound();
        return (
          <DocsPage full>
            <FamilyStatusClient fam={fam} />
          </DocsPage>
        );
      },
    },

    model: {
      generateStaticParams(): Array<{ name: string }> {
        return statusModels.map((name) => ({ name }));
      },
      async generateMetadata(props: { params: Promise<{ name: string }> }) {
        const { name } = await props.params;
        const modelName = decodeURIComponent(name);
        return statusMetadata(
          lang,
          ['status', 'model', encodeURIComponent(modelName)],
          '{model} 价格、可用率与性能',
          '查看 {model} 的可用性、响应延迟、定价、24 小时真实调用性能与 API 接入方式。',
          { model: modelName },
        );
      },
      async Page(props: { params: Promise<{ name: string }> }) {
        const { name } = await props.params;
        const modelName = decodeURIComponent(name);
        if (!modelName) notFound();
        return (
          <DocsPage full>
            <ModelDetailClient name={modelName} />
          </DocsPage>
        );
      },
    },
  };
}
