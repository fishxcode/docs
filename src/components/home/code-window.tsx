'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, CircleAlert, Copy } from 'lucide-react';

export type CodeTab = {
  label: string;
  /** 原始代码，复制用 */
  code: string;
  /** 构建期高亮好的节点 */
  node: ReactNode;
};

/** 复制结果：未操作、成功、失败（剪贴板 API 与 execCommand 都不可用） */
type CopyState = 'idle' | 'copied' | 'failed';

/** 复制结果提示的显示时长；失败提示带操作说明，停留更久 */
const RESET_MS: Record<Exclude<CopyState, 'idle'>, number> = { copied: 1600, failed: 4000 };

/** 剪贴板 API 不可用（http 环境、iframe 未授权 clipboard-write）时退回 execCommand */
function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

/** 方向键、Home、End 对应的目标 Tab；其他按键返回 null */
function targetTab(key: string, index: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return index + 1;
    case 'ArrowLeft':
      return index - 1;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/**
 * 首屏右侧的接入示例窗口。高亮在服务端（构建期）完成，这里只负责切换 Tab 与复制；
 * 两种主题下窗口都是深色。Tab 遵循 WAI-ARIA：左右键循环切换，Home / End 跳到首尾。
 */
export function CodeWindow({
  tabs,
  label,
  copyLabel,
  copiedLabel,
  failedLabel,
}: {
  tabs: CodeTab[];
  label: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
}) {
  const id = useId();
  const [active, setActive] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const resetTimer = useRef<number | undefined>(undefined);
  /** 复制请求的序号：只有最新一次请求能更新状态，旧请求晚到的结果直接丢弃 */
  const copyRequest = useRef(0);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const select = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    setActive(next);
    // 切换 Tab 后，上一个 Tab 尚未完成的复制结果作废
    copyRequest.current += 1;
    window.clearTimeout(resetTimer.current);
    setCopyState('idle');
    tabRefs.current[next]?.focus();
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const target = targetTab(event.key, index, tabs.length);
    if (target === null) return;
    // 阻止方向键顺带滚动页面
    event.preventDefault();
    select(target);
  };

  const copy = async () => {
    const request = ++copyRequest.current;
    const text = tabs[active].code;
    let result: Exclude<CopyState, 'idle'> = 'copied';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      if (!legacyCopy(text)) result = 'failed';
    }
    if (request !== copyRequest.current) return;
    setCopyState(result);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState('idle'), RESET_MS[result]);
  };

  const status = copyState === 'copied' ? copiedLabel : copyState === 'failed' ? failedLabel : '';

  return (
    <figure
      aria-label={label}
      className="overflow-hidden rounded-xl border border-black/10 bg-[#A9AFB6] text-left"
    >
      <div className="flex items-center border-b border-black/10 pr-2">
        <div role="tablist" aria-label={label} className="flex min-w-0 overflow-x-auto">
          {tabs.map((tab, index) => {
            const selected = index === active;
            return (
              <button
                key={tab.label}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${index}`}
                aria-selected={selected}
                aria-controls={`${id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={`relative shrink-0 px-4 py-3 font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none focus-visible:ring-inset ${
                  selected
                    ? 'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={status || copyLabel}
          title={status || copyLabel}
          className="ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
        >
          {copyState === 'copied' ? (
            <Check aria-hidden="true" className="size-4 text-emerald-400" />
          ) : copyState === 'failed' ? (
            <CircleAlert aria-hidden="true" className="size-4 text-amber-400" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        // 固定最小高度，切换 Tab 时窗口不跳动；Shiki 自带的底色让位给窗口底色
        className="min-h-[17rem] overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.7] md:text-[13px] [&_pre]:bg-transparent! [&_pre]:outline-none"
      >
        {tabs[active].node}
      </div>
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
    </figure>
  );
}
