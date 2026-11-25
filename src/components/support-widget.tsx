'use client';

import { useEffect } from 'react';
import { siteConfig } from '@/lib/site';
import { installSupportDrag } from '@/lib/support-drag';

/** 注入的 SDK 脚本带这个属性（与主站首页 Worker 的标记一致） */
const SCRIPT_MARKER = 'data-fishxcode-support';
/**
 * 挂在 <html> 上的显示开关：只有带这个属性时客服悬浮卡片才显示（规则见 global.css）。
 * SDK 没有销毁接口，离开首页后靠它把卡片藏起来，回到首页再露出，不重复加载。
 */
const VISIBLE_ATTRIBUTE = 'data-support-visible';
/** 浏览器一直不空闲时，最多等这么久也要加载 */
const IDLE_TIMEOUT_MS = 3000;
/** 不支持 requestIdleCallback（Safari）时的固定延迟 */
const IDLE_FALLBACK_MS = 1500;

/** SDK 的加载过程，整个页面会话只有一份；加载失败时清空，下次进入首页重试 */
let sdkLoading: Promise<void> | undefined;

/** 等页面 load 之后、浏览器空闲时执行任务，返回取消函数 */
function runAfterLoadWhenIdle(task: () => void): () => void {
  let cancelScheduled = () => {};
  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(task, { timeout: IDLE_TIMEOUT_MS });
      cancelScheduled = () => window.cancelIdleCallback(handle);
    } else {
      const handle = window.setTimeout(task, IDLE_FALLBACK_MS);
      cancelScheduled = () => window.clearTimeout(handle);
    }
  };

  if (document.readyState === 'complete') {
    schedule();
    return () => cancelScheduled();
  }
  window.addEventListener('load', schedule, { once: true });
  return () => {
    window.removeEventListener('load', schedule);
    cancelScheduled();
  };
}

/** 加载客服 SDK；脚本 load 之后 resolve，error 时撤掉脚本并 reject */
function loadSupportSdk(): Promise<void> {
  sdkLoading ??= new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_MARKER}]`);
    // 热更新会重置本模块但脚本还在：加载完成的标记记在脚本元素上，不随模块丢失
    if (existing?.dataset.loaded) {
      resolve();
      return;
    }
    const script = existing ?? document.createElement('script');
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      'error',
      () => {
        script.remove();
        sdkLoading = undefined;
        reject(new Error('Support SDK failed to load'));
      },
      { once: true },
    );
    if (!existing) {
      script.src = siteConfig.support.sdkUrl;
      script.async = true;
      script.setAttribute(SCRIPT_MARKER, '');
      document.body.appendChild(script);
    }
  });
  return sdkLoading;
}

/**
 * 首页的在线客服（不渲染任何内容），行为与主站首页一致：悬浮卡片可拖动、位置会被记住。
 * 主站 iframe 目前不加载客服，因此文档首页无论是否嵌入都自行加载。
 *
 * SDK 解压后约 3MB：等页面加载完、浏览器空闲时才注入，不和首屏抢带宽与主线程；
 * 只有访问过首页才会加载，离开首页时卡片隐藏、拖动增强撤掉。
 */
export function SupportWidget() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(VISIBLE_ATTRIBUTE, '');
    let active = true;
    let disposeDrag = () => {};
    const cancel = runAfterLoadWhenIdle(() => {
      loadSupportSdk().then(
        () => {
          // SDK 执行后才挂载悬浮卡片，此时再开始找卡片，轮询时限不会被下载时间吃掉
          if (active) disposeDrag = installSupportDrag();
        },
        () => {
          // 网络失败或被拦截插件屏蔽：首页照常可用，只是没有悬浮客服
        },
      );
    });

    return () => {
      active = false;
      cancel();
      disposeDrag();
      root.removeAttribute(VISIBLE_ATTRIBUTE);
    };
  }, []);

  return null;
}
