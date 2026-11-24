import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

/**
 * 首页各区块共用的排版部件。视觉取向是「编辑式」排版：大号粗体标题、等宽小标题、
 * 细线分栏与编号，配色只用 Fumadocs 主题色加 global.css 里的首页专用色（brand / paper / ink）。
 */

/** 首页统一版心（与页脚同宽） */
export const container = 'mx-auto w-full max-w-[1200px] px-6';

/** 区块大标题 */
export const headingClass =
  'mt-4 text-3xl leading-[1.15] font-bold tracking-tight text-balance md:text-4xl lg:text-[2.75rem]';

/** 窄栏（5/12 宽）里的区块标题：大屏封顶 40px，避免中文长句折成三行 */
export const narrowHeadingClass =
  'mt-4 text-3xl leading-[1.15] font-bold tracking-tight text-balance md:text-4xl lg:text-[2.5rem]';

/** 细线网格：父元素铺边框色，子元素铺纸色，1px 间隙即分隔线 */
export const hairlineGrid = 'grid gap-px overflow-hidden rounded-xl border border-fd-border bg-fd-border';

/** 卡片式链接的焦点样式（网格内用内描边，避免被父容器裁掉） */
export const cardFocus =
  'focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none focus-visible:ring-inset';

/** 两位编号：01、02… */
export const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 中日文标题按全角标点切成不可拆的短语（inline-block），只在短语之间换行。
 * text-balance 对 CJK 只会按字数均分，常把一个词拆到两行；
 * 不含全角标点的文本（英、法、俄、越等）原样输出，照常按空格换行。
 */
export function Phrases({ text }: { text: string }) {
  const parts = text.split(/(?<=[，、；：])/);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className="inline-block">
          {part}
        </span>
      ))}
    </>
  );
}

/**
 * 等宽小标题：方点 + 大写英文标签。与主站首页一样，各语言都用同一组英文标签作版式元素，
 * 标上 lang="en"，读屏按英文发音。
 */
export function Eyebrow({ children, className = 'text-brand' }: { children: ReactNode; className?: string }) {
  return (
    <p
      lang="en"
      className={`inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.12em] uppercase ${className}`}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 bg-current" />
      {children}
    </p>
  );
}

/** 区块开头：左侧小标题 + 大标题，右侧说明与可选操作，底边对齐 */
export function SectionIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
      <div className="lg:col-span-7">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className={headingClass}>
          <Phrases text={title} />
        </h2>
      </div>
      <div className="lg:col-span-5">
        <p className="text-pretty text-fd-muted-foreground md:text-lg">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'inverted' | 'ghost-inverted';

const buttonVariant: Record<ButtonVariant, string> = {
  primary:
    'bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/85 focus-visible:ring-fd-ring focus-visible:ring-offset-fd-background',
  secondary:
    'border border-fd-border bg-paper text-fd-foreground hover:bg-fd-accent focus-visible:ring-fd-ring focus-visible:ring-offset-fd-background',
  // 以下两种用在 bg-ink 深色色带上
  inverted: 'bg-white text-ink hover:bg-white/90 focus-visible:ring-white/60 focus-visible:ring-offset-ink',
  'ghost-inverted':
    'border border-white/25 text-white hover:bg-white/10 focus-visible:ring-white/60 focus-visible:ring-offset-ink',
};

/** 站外链接的 rel：带推广码的注册链接额外声明 sponsored */
const externalRel = (sponsored?: boolean) => (sponsored ? 'noreferrer noopener sponsored' : 'noreferrer noopener');

/** 按钮样式的链接。站内走 next/link；站外（注册、企业站）在新标签页打开 */
export function ButtonLink({
  href,
  variant,
  external,
  sponsored,
  arrow,
  children,
}: {
  href: string;
  variant: ButtonVariant;
  external?: boolean;
  /** 带推广参数的地址（aff 链接）：向搜索引擎声明推广关系 */
  sponsored?: boolean;
  arrow?: boolean;
  children: ReactNode;
}) {
  const className = `home-action group inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto ${buttonVariant[variant]}`;
  const content = (
    <>
      {children}
      {arrow ? (
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      ) : null}
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel={externalRel(sponsored)} className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

/** 品牌色文字链接；站外链接用斜箭头并在新标签页打开 */
export function TextLink({ href, external, children }: { href: string; external?: boolean; children: ReactNode }) {
  const className =
    'group inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-brand focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none';
  const Icon = external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      {children}
      <Icon
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel={externalRel()} className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
