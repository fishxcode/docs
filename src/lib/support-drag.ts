/**
 * 在线客服悬浮卡片的拖动（移植自主站首页 Worker 里的 enableSupportDrag，行为保持一致）。
 *
 * 客服 SDK（腾讯 TRTC）把悬浮卡片渲染在 #contact-widget-auto 的开放 Shadow DOM 里。
 * 这里只调整卡片的位置，不碰 SDK 的聊天面板和消息连接：
 * - 按住卡片内容区移动超过 6px 才算拖动，确认拖动后才捕获指针，轻点内部按钮仍是原来的点击
 * - 拖动结束后 600ms 内，在 SDK 之前（捕获阶段）屏蔽由这次拖动产生的 click
 * - 位置按可移动范围的 0~1 比例存进 localStorage，窗口缩放、旋转、软键盘弹出后按比例复位
 * - SDK 异步挂载、卡片节点会被重渲染替换：启动阶段轮询宿主节点（250ms × 120 次），
 *   找到后改用 MutationObserver 跟踪，节点换了就重新绑定
 */

/** SDK 挂在 body 下的宿主节点（开放 Shadow DOM）；global.css 里「只在首页显示」的规则也认这个 id */
const SUPPORT_HOST_ID = 'contact-widget-auto';
const CARD_SELECTOR = '.trtc-float-card.widget-sdk-float-card';
const HANDLE_SELECTOR = '.trtc-float-card__content';
const STORAGE_KEY = 'fishxcode:support-position:v1';
const DISCOVERY_INTERVAL_MS = 250;
const DISCOVERY_ATTEMPTS = 120;
const DRAG_THRESHOLD_PX = 6;
const CLICK_SUPPRESS_MS = 600;
/** 卡片与可视区域边缘的最小间距 */
const EDGE_GAP_PX = 8;

/** 卡片位置：在可移动范围内的横、纵向比例（0~1） */
type Position = { x: number; y: number };

type Gesture = {
  pointerId: number;
  startX: number;
  startY: number;
  /** 按下时卡片的视口坐标 */
  left: number;
  top: number;
  moved: boolean;
};

/** 已安装实例的卸载函数；全站只装一份 */
let activeDispose: (() => void) | null = null;

const isRatio = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;

function readStoredPosition(): Position | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (stored && typeof stored === 'object' && 'x' in stored && 'y' in stored) {
      const { x, y } = stored;
      if (isRatio(x) && isRatio(y)) return { x, y };
    }
  } catch {
    // 存储被禁用或内容损坏：当作没有保存过，当前页面仍可拖动
  }
  return null;
}

function storePosition(position: Position) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch {
    // 存储不可用不影响拖动，只是下次打开不记得位置
  }
}

/**
 * 给客服悬浮卡片装上拖动，返回卸载函数（停止轮询、断开观察器、移除事件、恢复卡片样式）。
 * 只应在 SDK 脚本加载后调用；重复调用直接返回已安装实例的卸载函数。
 */
export function installSupportDrag(): () => void {
  if (activeDispose) return activeDispose;

  let position = readStoredPosition();
  let disposed = false;
  let attempts = 0;
  let discoveryTimer: number | undefined;
  let frame = 0;
  let observer: MutationObserver | undefined;
  let currentHandle: HTMLElement | null = null;
  let unbind = () => {};

  function bind(root: ShadowRoot) {
    const card = root.querySelector<HTMLElement>(CARD_SELECTOR);
    const handle = card?.querySelector<HTMLElement>(HANDLE_SELECTOR) ?? null;
    if (handle === currentHandle) return;

    unbind();
    unbind = () => {};
    currentHandle = handle;
    if (!card || !handle) return;

    const controller = new AbortController();
    const { signal } = controller;
    let gesture: Gesture | null = null;
    let suppressClickUntil = 0;
    const originalTouchAction = handle.style.touchAction;
    const originalCursor = handle.style.cursor;
    handle.style.touchAction = 'none';
    handle.style.cursor = 'grab';

    /** 卡片左上角可放置的范围：起点（left、top）与可移动的宽高（x、y） */
    const bounds = () => {
      const viewport = window.visualViewport;
      const width = viewport?.width || window.innerWidth;
      const height = viewport?.height || window.innerHeight;
      return {
        left: (viewport?.offsetLeft || 0) + Math.min(EDGE_GAP_PX, Math.max(0, (width - card.offsetWidth) / 2)),
        top: (viewport?.offsetTop || 0) + Math.min(EDGE_GAP_PX, Math.max(0, (height - card.offsetHeight) / 2)),
        x: Math.max(0, width - card.offsetWidth - EDGE_GAP_PX * 2),
        y: Math.max(0, height - card.offsetHeight - EDGE_GAP_PX * 2),
      };
    };

    /** 把卡片放到视口坐标（限制在可放置范围内），返回对应的比例位置 */
    const place = (left: number, top: number): Position => {
      const area = bounds();
      const clampedLeft = Math.max(area.left, Math.min(area.left + area.x, left));
      const clampedTop = Math.max(area.top, Math.min(area.top + area.y, top));
      const styles = { left: `${clampedLeft}px`, top: `${clampedTop}px`, right: 'auto', bottom: 'auto' };
      for (const [name, value] of Object.entries(styles)) card.style.setProperty(name, value, 'important');
      return {
        x: area.x ? (clampedLeft - area.left) / area.x : 0,
        y: area.y ? (clampedTop - area.top) / area.y : 0,
      };
    };

    /** 按保存的比例复位；拖动中、卡片尚未渲染出尺寸时不动 */
    const restore = () => {
      if (!position || gesture || !card.offsetWidth || !card.offsetHeight) return;
      const area = bounds();
      place(area.left + position.x * area.x, area.top + position.y * area.y);
    };

    handle.addEventListener(
      'pointerdown',
      (event) => {
        if (!event.isPrimary || event.button !== 0 || gesture) return;
        suppressClickUntil = 0;
        const rect = card.getBoundingClientRect();
        gesture = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          left: rect.left,
          top: rect.top,
          moved: false,
        };
      },
      { signal },
    );

    window.addEventListener(
      'pointermove',
      (event) => {
        if (!gesture || event.pointerId !== gesture.pointerId) return;
        const dx = event.clientX - gesture.startX;
        const dy = event.clientY - gesture.startY;
        if (!gesture.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
          gesture.moved = true;
          // 确认是拖动后才捕获指针，轻点内部按钮时保留原始的 click 目标
          try {
            handle.setPointerCapture(event.pointerId);
          } catch {
            // 合成事件或指针已失效
          }
        }
        if (!gesture.moved) return;
        event.preventDefault();
        handle.style.cursor = 'grabbing';
        position = place(gesture.left + dx, gesture.top + dy);
      },
      { signal, passive: false },
    );

    const finish = (event: PointerEvent) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      const moved = gesture.moved;
      gesture = null;
      handle.style.cursor = 'grab';
      if (moved) {
        suppressClickUntil = performance.now() + CLICK_SUPPRESS_MS;
        if (position) storePosition(position);
      }
      try {
        if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      } catch {
        // 指针已失效
      }
    };
    for (const type of ['pointerup', 'pointercancel'] as const) {
      window.addEventListener(type, finish, { signal, capture: true });
    }
    // 触屏上隐式捕获会从内部按钮转移过来：只认手柄自己的 lostpointercapture
    window.addEventListener(
      'lostpointercapture',
      (event) => {
        if (event.composedPath()[0] === handle) finish(event);
      },
      { signal, capture: true },
    );

    // 在 SDK 处理之前屏蔽拖动产生的 click；键盘触发的 click（detail 为 0）不受影响
    card.addEventListener(
      'click',
      (event) => {
        if (performance.now() < suppressClickUntil && event.detail !== 0) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { signal, capture: true },
    );

    window.addEventListener('resize', restore, { signal });
    window.visualViewport?.addEventListener('resize', restore, { signal });
    window.visualViewport?.addEventListener('scroll', restore, { signal });
    const resizeObserver = new ResizeObserver(restore);
    resizeObserver.observe(card);
    restore();

    unbind = () => {
      controller.abort();
      resizeObserver.disconnect();
      handle.style.touchAction = originalTouchAction;
      handle.style.cursor = originalCursor;
    };
  }

  function discover() {
    if (disposed) return;
    const root = document.getElementById(SUPPORT_HOST_ID)?.shadowRoot;
    if (!root) {
      attempts += 1;
      if (attempts < DISCOVERY_ATTEMPTS) discoveryTimer = window.setTimeout(discover, DISCOVERY_INTERVAL_MS);
      // 超时就放弃，并允许之后重新安装
      else dispose();
      return;
    }
    observer = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        bind(root);
      });
    });
    observer.observe(root, { childList: true, subtree: true });
    bind(root);
  }

  function dispose() {
    disposed = true;
    window.clearTimeout(discoveryTimer);
    cancelAnimationFrame(frame);
    observer?.disconnect();
    unbind();
    unbind = () => {};
    currentHandle = null;
    if (activeDispose === dispose) activeDispose = null;
  }

  activeDispose = dispose;
  discover();
  return dispose;
}
