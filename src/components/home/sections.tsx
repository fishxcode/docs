import Image from 'next/image';
import Link from '@/components/app-link';
import { Boxes, Brain, Check, MessageCircle, type LucideIcon } from 'lucide-react';
import {
  fmt,
  HOME_CLIENTS,
  HOME_ENDPOINTS,
  HOME_GROUPS,
  HOME_MODELS_PATH,
  HOME_PLANS,
  HOME_PROVIDERS,
  HOME_START_PATH,
  type GroupCategory,
  type HomeCopy,
  type HomePageCopy,
} from '@/lib/home-copy';
import type { HomeRedesignCopy } from '@/lib/home-redesign-copy';
import { localePath, type Locale } from '@/lib/i18n';
import { siteConfig } from '@/lib/site';
import { CodeWindow, type CodeTab } from './code-window';
import { GroupRatioList } from './group-ratio-list';
import { HeroClientIcons, HeroFlowLines } from './hero-ambient';
import {
  ButtonLink,
  cardFocus,
  container,
  Eyebrow,
  hairlineGrid,
  narrowHeadingClass,
  pad,
  Phrases,
  SectionIntro,
  TextLink,
} from './primitives';

/** 每个区块收到的参数：页面语言、全站共用文案与首页区块文案 */
type SectionProps = {
  lang: Locale;
  shared: HomeCopy;
  copy: HomePageCopy;
};

const focusRing = 'focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none';

/** 月包页与计费页（站内路径，渲染时加语言前缀） */
const PLANS_PATH = '/subscription-plans';
const BILLING_PATH = '/billing-groups';

/** 首屏三条要点的链接，与 copy.hero.points 按下标对应 */
const HERO_POINT_LINKS: ReadonlyArray<{ href: string; external: boolean; absolute?: boolean }> = [
  { href: BILLING_PATH, external: false },
  // 状态页暂只有默认语言版本，其余语言首页也统一指向 /status
  { href: siteConfig.links.status, external: false, absolute: true },
  { href: siteConfig.links.enterprise, external: true },
];

/** 「为什么选择」四张卡片的英文等宽标签（版式元素，各语言共用），与 shared.features 按下标对应 */
const WHY_LABELS = ['Official', 'Groups', 'Pay as you go', 'Enterprise'];

/** 供应商图标：优先用仓库里的品牌图片，缺图的用 Lucide 图标，不再用首字母占位 */
const PROVIDER_IMAGES: Readonly<Record<string, string>> = {
  OpenAI: '/img/clients/openai.jpg',
  'Anthropic Claude': '/img/clients/claude.jpg',
  'Google Gemini': '/img/clients/gemini.png',
  'xAI Grok': '/img/clients/grok.png',
  Qwen: '/img/clients/qwen.png',
};

const PROVIDER_ICONS: Readonly<Record<string, LucideIcon>> = {
  DeepSeek: Brain,
  GLM: Boxes,
};

/** 「三步上手」各步链接的教程，与 copy.steps.items 按下标对应 */
const STEP_PATHS = ['/account', BILLING_PATH, HOME_START_PATH] as const;

const GROUP_CATEGORIES: readonly GroupCategory[] = ['codex', 'claude', 'other'];

/** 文案里的分组名（如 codex-sub-june）以行内代码显示 */
function withInlineCode(text: string, term: string) {
  const index = text.indexOf(term);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <code className="rounded bg-fd-muted px-1 py-0.5 font-mono text-[0.85em] text-fd-foreground">{term}</code>
      {text.slice(index + term.length)}
    </>
  );
}

/** 首屏：左侧主张与行动，右侧客户端图标与可切换、可复制的接入代码 */
export function HeroSection({
  lang,
  shared,
  copy,
  redesign,
  codeTabs,
}: SectionProps & { redesign: HomeRedesignCopy; codeTabs: CodeTab[] }) {
  return (
    <section className="home-hero border-b border-fd-border">
      <HeroFlowLines />
      <div
        className={`${container} home-hero-content grid items-center gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-10`}
      >
        <div className="home-enter lg:col-span-6">
          <Link
            href={localePath(lang, PLANS_PATH)}
            className={`inline-flex items-center gap-2 rounded-md border border-fd-border bg-paper px-2.5 py-1 text-xs font-medium text-fd-muted-foreground transition-colors hover:border-brand/40 hover:text-brand ${focusRing}`}
          >
            <span aria-hidden="true" className="size-1.5 bg-brand" />
            {redesign.badge}
          </Link>

          <h1 className="mt-6 text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.75rem]">
            {redesign.heroTitle[0]}
            <br />
            <span className="text-brand">{redesign.heroTitle[1]}</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-fd-muted-foreground md:text-lg">{copy.hero.description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={siteConfig.links.register} external sponsored variant="primary" arrow>
              {shared.register}
            </ButtonLink>
            <ButtonLink href={localePath(lang, HOME_START_PATH)} variant="secondary">
              {shared.docs}
            </ButtonLink>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fd-muted-foreground">
            {copy.hero.points.map((point, index) => {
              const link = HERO_POINT_LINKS[index];
              const className = `inline-flex items-center gap-2 rounded-sm hover:text-brand ${focusRing}`;
              const content = (
                <>
                  <Check aria-hidden="true" className="size-4 shrink-0 text-brand" />
                  {point}
                </>
              );
              return (
                <li key={point}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noreferrer noopener" className={className}>
                      {content}
                    </a>
                  ) : (
                    <Link href={link.absolute ? link.href : localePath(lang, link.href)} className={className}>
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="home-enter home-enter-delayed min-w-0 lg:col-span-6">
          <HeroClientIcons lang={lang} />
          <CodeWindow
            tabs={codeTabs}
            label={copy.hero.codeLabel}
            copyLabel={copy.hero.copy}
            copiedLabel={copy.hero.copied}
            failedLabel={copy.hero.copyFailed}
          />
        </div>
      </div>
    </section>
  );
}

/** 深色数据带：把首屏与后续内容切开，数字比装饰更重要 */
export function StatsSection({ redesign }: { redesign: HomeRedesignCopy }) {
  return (
    <section className="bg-ink text-white">
      <div className={`${container} grid grid-cols-2 divide-x divide-y divide-white/15 md:grid-cols-4 md:divide-y-0`}>
        {redesign.stats.map((stat) => (
          <div key={stat.label} className="px-6 py-8">
            <p className="text-xs text-white/60">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 可靠性：左侧说明，右侧是真实状态网格的静态预览 */
export function ReliabilitySection({ lang, redesign }: { lang: Locale; redesign: HomeRedesignCopy }) {
  const { reliability, status } = redesign;
  return (
    <section className="py-20 md:py-28">
      <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
        <div className="lg:col-span-5">
          <Eyebrow>{reliability.eyebrow}</Eyebrow>
          <h2 className={narrowHeadingClass}>
            <Phrases text={reliability.title} />
          </h2>
          <p className="mt-5 text-pretty text-fd-muted-foreground md:text-lg">{reliability.description}</p>
          <div className="mt-8">
            <TextLink href={localePath(lang, '/status')}>{reliability.linkLabel}</TextLink>
          </div>
        </div>

        <div className="rounded-xl border border-fd-border bg-paper p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">{status.title}</h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
              {status.legend.map((item, index) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${['bg-brand', 'bg-[#BA7517]', 'bg-[#A32D2D]'][index]}`}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="mt-6 grid gap-1.5"
            style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}
            aria-hidden="true"
          >
            {Array.from({ length: 54 }, (_, index) => (
              <span
                key={index}
                className={`h-2 rounded-sm ${index % 13 === 0 ? 'bg-[#A32D2D]' : index % 7 === 0 ? 'bg-[#BA7517]' : 'bg-brand/70'}`}
              />
            ))}
          </div>
          <p className="mt-5 text-xs text-fd-muted-foreground">{status.note}</p>
        </div>
      </div>
    </section>
  );
}

/** 模型供应商标签条：每个标签都进模型列表，那里有实时的型号、分组与价格 */
export function ProvidersStrip({ lang, copy }: SectionProps) {
  const href = localePath(lang, HOME_MODELS_PATH);
  return (
    <section className="border-b border-fd-border">
      <div className={`${container} flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:gap-12`}>
        <div className="lg:w-80 lg:shrink-0">
          <Eyebrow>Providers</Eyebrow>
          <h2 className="mt-3 text-lg font-semibold">{copy.providers.title}</h2>
          <p className="mt-1 text-sm text-fd-muted-foreground">{copy.providers.note}</p>
        </div>
        <ul className="flex flex-wrap gap-2.5">
          {HOME_PROVIDERS.map((name) => {
            const image = PROVIDER_IMAGES[name];
            const Icon = PROVIDER_ICONS[name];
            return (
              <li key={name}>
                <Link
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-md border border-fd-border bg-paper px-3.5 py-2 text-sm text-fd-muted-foreground transition-colors hover:border-brand/50 hover:text-brand ${focusRing}`}
                >
                  {image ? (
                    <Image src={image} alt="" width={20} height={20} className="size-5 rounded object-contain" />
                  ) : Icon ? (
                    <Icon aria-hidden="true" className="size-5 shrink-0 text-fd-foreground" />
                  ) : (
                    <span aria-hidden="true" className="font-mono text-base leading-none font-semibold text-fd-foreground">
                      {name[0]}
                    </span>
                  )}
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** 01 为什么选择：四张编号卡片（内容即全站共用的 features） */
export function WhySection({ shared, copy }: SectionProps) {
  return (
    <section className="py-20 md:py-28">
      <div className={container}>
        <SectionIntro eyebrow="01 / Why FishXCode" title={copy.why.title} description={copy.why.description} />
        <ul className={`${hairlineGrid} mt-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-4`}>
          {shared.features.map((feature, index) => (
            <li key={feature.title} className="flex flex-col bg-paper p-6 md:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-md bg-brand-soft font-mono text-xs text-brand">
                  {pad(index + 1)}
                </span>
                <span lang="en" className="font-mono text-[10px] tracking-[0.12em] text-fd-muted-foreground uppercase">
                  {WHY_LABELS[index]}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">{feature.details}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 02 套餐与分组：左侧月包三档，右侧按系列列出在售分组的倍率 */
export function PricingSection({ lang, copy }: SectionProps) {
  const pricing = copy.pricing;
  return (
    <section className="border-y border-fd-border bg-fd-card/60 py-20 md:py-28">
      <div className={container}>
        <SectionIntro eyebrow="02 / Pricing" title={pricing.title} description={pricing.description} />

        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="font-semibold">{pricing.plansTitle}</h3>
            <ol className={`${hairlineGrid} mt-4 sm:grid-cols-3`}>
              {HOME_PLANS.map((plan) => (
                <li key={plan.quota} className="bg-paper p-6">
                  <p className="font-mono text-xs text-fd-muted-foreground">
                    {fmt(pricing.planQuota, { quota: plan.quota })}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight">{plan.price}</p>
                  <p className="mt-4 inline-flex rounded-md bg-brand-soft px-2 py-0.5 font-mono text-xs font-medium text-brand">
                    {fmt(pricing.planRatio, { ratio: plan.ratio })}
                  </p>
                </li>
              ))}
            </ol>
            <ul className="mt-5 space-y-1.5 text-sm text-fd-muted-foreground">
              <li className="flex gap-2">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
                {pricing.planTerms}
              </li>
              <li className="flex gap-2">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
                <span>{withInlineCode(pricing.planGroup, 'codex-sub-june')}</span>
              </li>
            </ul>
            <div className="mt-6">
              <TextLink href={localePath(lang, PLANS_PATH)}>{pricing.plansCta}</TextLink>
            </div>
          </div>

          <div className="lg:col-span-5">
            <h3 className="font-semibold">{pricing.groupsTitle}</h3>
            {/* 运行时从 /api/pricing 拉最新倍率与分组说明，失败回退到 HOME_GROUPS 基线；见 group-ratio-list.tsx */}
            <GroupRatioList
              groups={HOME_GROUPS}
              categories={GROUP_CATEGORIES}
              categoryLabels={pricing.categories}
              lang={lang}
              copy={{ liveNote: pricing.groupsLiveNote }}
            />
            <p className="mt-4 text-xs text-fd-muted-foreground">{pricing.groupsNote}</p>
            <div className="mt-6">
              <TextLink href={localePath(lang, BILLING_PATH)}>{pricing.groupsCta}</TextLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 03 接入工具：全部客户端教程的细线网格，末尾附文档更新日期 */
export function ClientsSection({ lang, shared, copy, lastModified }: SectionProps & { lastModified?: string }) {
  const lastIndex = HOME_CLIENTS.length - 1;
  return (
    <section className="py-20 md:py-28">
      <div className={container}>
        <SectionIntro
          eyebrow="03 / Clients"
          title={copy.clients.title}
          description={fmt(copy.clients.description, { count: HOME_CLIENTS.length })}
        />
        <ul className={`${hairlineGrid} mt-12 grid-cols-2 sm:grid-cols-3 md:mt-16 lg:grid-cols-5`}>
          {HOME_CLIENTS.map((client, index) => (
            // 两列时最后一格独占一行，免得露出一块底色空格
            <li key={client.path} className={`bg-paper ${index === lastIndex ? 'col-span-2 sm:col-span-1' : ''}`}>
              <Link
                href={localePath(lang, client.path)}
                className={`home-card flex h-full items-center gap-2.5 px-3 py-3.5 sm:gap-3 sm:px-4 text-sm font-medium transition-colors hover:bg-fd-accent/40 ${cardFocus}`}
              >
                {client.icon ? (
                  <Image
                    src={client.icon}
                    width={24}
                    height={24}
                    alt=""
                    className="size-6 shrink-0 rounded-md object-contain"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-soft font-mono text-xs font-semibold text-brand"
                  >
                    {client.name[0]}
                  </span>
                )}
                <span className="min-w-0 truncate">{client.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        {lastModified ? (
          <p className="mt-6 text-xs text-fd-muted-foreground">
            {shared.updated}
            {lastModified.slice(0, 10)}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** 04 三步上手：左侧说明与教程入口，右侧编号步骤，最后一步附接入地址 */
export function StepsSection({ lang, copy }: SectionProps) {
  const steps = copy.steps;
  const lastIndex = steps.items.length - 1;
  return (
    <section className="border-y border-fd-border bg-fd-card/60">
      <div className={`${container} grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-16`}>
        <div className="lg:col-span-5">
          <Eyebrow>04 / Get started</Eyebrow>
          <h2 className={narrowHeadingClass}>
            <Phrases text={steps.title} />
          </h2>
          <p className="mt-5 text-pretty text-fd-muted-foreground md:text-lg">{steps.description}</p>
          <div className="mt-8">
            <ButtonLink href={localePath(lang, HOME_START_PATH)} variant="primary" arrow>
              {steps.cta}
            </ButtonLink>
          </div>
        </div>

        <ol className="border-t border-fd-foreground/80 lg:col-span-7">
          {steps.items.map((step, index) => (
            <li key={step.title} className="border-b border-fd-border">
              <Link
                href={localePath(lang, STEP_PATHS[index])}
                className={`group grid grid-cols-[3rem_1fr] gap-x-4 rounded-sm py-7 transition-colors hover:bg-fd-accent/30 ${focusRing}`}
              >
                <span className="font-mono text-sm text-brand">{pad(index + 1)}</span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold group-hover:text-brand">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">{step.description}</p>
                  {index === lastIndex ? (
                    <div className="mt-4 flex flex-col gap-2">
                      {(
                        [
                          ['Anthropic', HOME_ENDPOINTS.anthropic],
                          ['OpenAI', HOME_ENDPOINTS.openai],
                        ] as const
                      ).map(([label, url]) => (
                        <code
                          key={url}
                          className="inline-flex max-w-full items-center gap-2 self-start overflow-x-auto rounded-md border border-fd-border bg-paper px-2.5 py-1 font-mono text-xs whitespace-nowrap"
                        >
                          <span className="text-fd-muted-foreground">{label}</span>
                          {url}
                        </code>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** 底部深色色带：注册与企业服务，下方是客服联系方式（悬浮客服是 SupportWidget，只在首页加载） */
export function BottomCta({ shared, copy }: SectionProps) {
  const cta = copy.cta;
  const { email, wechat } = siteConfig.support;
  return (
    <section className="bg-ink text-white">
      <div className={`${container} py-20 md:py-24`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow className="text-white/60">Ready when you are</Eyebrow>
            <h2 className="mt-4 text-3xl leading-[1.12] font-bold tracking-tight text-balance md:text-4xl lg:text-5xl">
              <Phrases text={cta.title} />
            </h2>
            <p className="mt-5 text-pretty text-white/70 md:text-lg">{cta.description}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <ButtonLink href={siteConfig.links.register} external sponsored variant="inverted" arrow>
              {shared.register}
            </ButtonLink>
            <ButtonLink href={siteConfig.links.enterprise} external variant="ghost-inverted">
              {cta.enterprise}
            </ButtonLink>
          </div>
        </div>

        <div className="mt-14 grid gap-6 border-t border-white/15 pt-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <h3 className="flex items-center gap-2 font-semibold">
              <MessageCircle aria-hidden="true" className="size-4 text-white/70" />
              {cta.supportTitle}
            </h3>
            <p className="mt-2 max-w-xl text-sm text-pretty text-white/70">{cta.supportBody}</p>
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2 md:col-span-5">
            <div>
              <dt className="text-white/50">{cta.email}</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${email}`}
                  className="font-mono underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                >
                  {email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-white/50">{cta.wechat}</dt>
              <dd className="mt-1 font-mono">{wechat}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
