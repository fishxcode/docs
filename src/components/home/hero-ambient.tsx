import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from '@/components/app-link';
import { HOME_CLIENTS } from '@/lib/home-copy';
import { localePath, type Locale } from '@/lib/i18n';

/** 流线的位置（top%、left%）、时长与错峰（秒）。固定数值，服务端与浏览器输出一致 */
const FLOW_LINES = [
  [10, -12, 19, -5],
  [27, 28, 23, -12],
  [43, -20, 21, -8],
  [61, 38, 26, -18],
  [78, -8, 22, -14],
  [93, 18, 25, -3],
] as const;

type HomeClient = (typeof HOME_CLIENTS)[number];

/** 跑马灯只放有图标的重点客户端 */
const FEATURED_CLIENTS = HOME_CLIENTS.filter((client): client is HomeClient & { icon: string } =>
  Boolean(client.featured && client.icon),
);

/** 首屏背景的流线：只作装饰，不拦截点击，也不向读屏传达内容 */
export function HeroFlowLines() {
  return (
    <div aria-hidden="true" className="home-flow-lines">
      {FLOW_LINES.map(([top, left, duration, delay], index) => (
        <span
          key={index}
          className="home-flow-line"
          style={
            {
              top: `${top}%`,
              left: `${left}%`,
              '--flow-duration': `${duration}s`,
              '--flow-delay': `${delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * 代码窗口上方的客户端图标跑马灯，点击进对应教程。两组相同内容首尾相接实现无缝滚动；
 * 复制组对读屏隐藏、不参与 Tab 键导航。动效关闭时只显示一组（见 global.css）。
 */
export function HeroClientIcons({ lang }: { lang: Locale }) {
  return (
    <div className="home-client-icons">
      <div className="home-client-track">
        {[false, true].map((duplicate) => (
          <div
            key={String(duplicate)}
            className="home-client-group"
            data-duplicate={duplicate || undefined}
            aria-hidden={duplicate || undefined}
          >
            {FEATURED_CLIENTS.map((client) => (
              <Link
                key={client.path}
                href={localePath(lang, client.path)}
                aria-label={client.name}
                title={client.name}
                prefetch={false}
                tabIndex={duplicate ? -1 : undefined}
                className="home-client-icon"
              >
                <Image src={client.icon} width={26} height={26} alt="" draggable={false} />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
