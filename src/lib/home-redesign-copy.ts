import type { Locale } from './i18n';

export type HomeRedesignCopy = {
  heroTitle: readonly [string, string];
  badge: string;
  stats: readonly [
    { label: string; value: string },
    { label: string; value: string },
    { label: string; value: string },
    { label: string; value: string },
  ];
  reliability: { eyebrow: string; title: string; description: string; linkLabel: string };
  status: { title: string; legend: readonly [string, string, string]; note: string };
};

export const HOME_REDESIGN_COPY: Record<Locale, HomeRedesignCopy> = {
  zh: {
    heroTitle: ['企业级 LLM API', '网关，开箱即用'],
    badge: '统一网关 · 85+ 模型 · 9 家厂商',
    stats: [
      { label: '在售模型', value: '85+' },
      { label: '上游厂商', value: '9' },
      { label: '24h 可用率', value: '99.94%' },
      { label: '平均延迟', value: '1.2s' },
    ],
    reliability: {
      eyebrow: '可靠性',
      title: '自建官方账号池，自动故障切换',
      description: '每个模型背后有多个官方账号；失败自动重试下一个，客户端无需任何配置。',
      linkLabel: '了解容灾机制 →',
    },
    status: {
      title: '实时模型状态',
      legend: ['正常', '缓慢', '故障'],
      note: '每个方块 = 一个在测模型，悬停查看详情',
    },
  },
  en: {
    heroTitle: ['Enterprise-grade LLM API', 'gateway, ready out of the box'],
    badge: 'Unified gateway · 85+ models · 9 providers',
    stats: [
      { label: 'Models available', value: '85+' },
      { label: 'Upstream providers', value: '9' },
      { label: '24h uptime', value: '99.94%' },
      { label: 'Average latency', value: '1.2s' },
    ],
    reliability: {
      eyebrow: 'Reliability',
      title: 'Self-built official account pools with automatic failover',
      description:
        'Every model is backed by multiple official accounts. If one fails, the next is retried automatically, with no client-side configuration needed.',
      linkLabel: 'Learn about failover →',
    },
    status: {
      title: 'Live model status',
      legend: ['Operational', 'Degraded', 'Outage'],
      note: 'Each square represents a monitored model — hover for details',
    },
  },
  fr: {
    heroTitle: ['API LLM de niveau entreprise,', 'clé en main'],
    badge: 'Passerelle unifiée · 85+ modèles · 9 fournisseurs',
    stats: [
      { label: 'Modèles disponibles', value: '85+' },
      { label: 'Fournisseurs en amont', value: '9' },
      { label: 'Disponibilité sur 24 h', value: '99.94%' },
      { label: 'Latence moyenne', value: '1.2s' },
    ],
    reliability: {
      eyebrow: 'Fiabilité',
      title: 'Pools de comptes officiels internes et basculement automatique',
      description:
        'Chaque modèle s’appuie sur plusieurs comptes officiels : en cas d’échec, la requête est automatiquement réessayée sur le compte suivant, sans aucune configuration côté client.',
      linkLabel: 'Découvrir la tolérance aux pannes →',
    },
    status: {
      title: 'État des modèles en direct',
      legend: ['Normal', 'Lent', 'Indisponible'],
      note: 'Chaque carré correspond à un modèle surveillé ; survolez-le pour plus de détails',
    },
  },
  es: {
    heroTitle: ['API LLM de nivel empresarial,', 'lista para usar'],
    badge: 'Puerta de enlace unificada · 85+ modelos · 9 proveedores',
    stats: [
      { label: 'Modelos disponibles', value: '85+' },
      { label: 'Proveedores de origen', value: '9' },
      { label: 'Disponibilidad 24 h', value: '99.94%' },
      { label: 'Latencia media', value: '1.2s' },
    ],
    reliability: {
      eyebrow: 'Fiabilidad',
      title: 'Pools de cuentas oficiales propios con conmutación automática por error',
      description:
        'Cada modelo cuenta con varias cuentas oficiales: si una falla, se reintenta automáticamente con la siguiente, sin necesidad de configuración en el cliente.',
      linkLabel: 'Conocer el mecanismo de tolerancia a fallos →',
    },
    status: {
      title: 'Estado de los modelos en tiempo real',
      legend: ['Normal', 'Lento', 'Caído'],
      note: 'Cada cuadrado representa un modelo monitorizado; pase el cursor para ver los detalles',
    },
  },
  pt: {
    heroTitle: ['API LLM de nível empresarial,', 'pronta para usar'],
    badge: 'Gateway unificado · 85+ modelos · 9 provedores',
    stats: [
      { label: 'Modelos disponíveis', value: '85+' },
      { label: 'Provedores de origem', value: '9' },
      { label: 'Disponibilidade em 24h', value: '99.94%' },
      { label: 'Latência média', value: '1.2s' },
    ],
    reliability: {
      eyebrow: 'Confiabilidade',
      title: 'Pools de contas oficiais próprios com failover automático',
      description:
        'Cada modelo conta com várias contas oficiais; em caso de falha, a próxima é tentada automaticamente, sem qualquer configuração no cliente.',
      linkLabel: 'Saiba mais sobre a tolerância a falhas →',
    },
    status: {
      title: 'Status dos modelos em tempo real',
      legend: ['Normal', 'Lento', 'Indisponível'],
      note: 'Cada quadrado representa um modelo monitorado; passe o mouse para ver os detalhes',
    },
  },
  ru: {
    heroTitle: ['Корпоративный LLM API-шлюз', 'готов к работе сразу'],
    badge: 'Единый шлюз · 85+ моделей · 9 провайдеров',
    stats: [
      { label: 'Доступные модели', value: '85+' },
      { label: 'Провайдеры', value: '9' },
      { label: 'Доступность за 24 ч', value: '99.94%' },
      { label: 'Средняя задержка', value: '1.2s' },
    ],
    reliability: {
      eyebrow: 'Надёжность',
      title: 'Собственные пулы официальных аккаунтов с автоматическим переключением',
      description:
        'За каждой моделью закреплено несколько официальных аккаунтов: при сбое запрос автоматически повторяется на следующем, без каких-либо настроек на стороне клиента.',
      linkLabel: 'Подробнее об отказоустойчивости →',
    },
    status: {
      title: 'Статус моделей в реальном времени',
      legend: ['Норма', 'Медленно', 'Сбой'],
      note: 'Каждый квадрат — модель, за которой ведётся мониторинг; наведите курсор для подробностей',
    },
  },
  ja: {
    heroTitle: ['エンタープライズ向け LLM API', 'ゲートウェイ、すぐに使えます'],
    badge: '統一ゲートウェイ · 85+ モデル · 9 社のプロバイダー',
    stats: [
      { label: '提供モデル数', value: '85+' },
      { label: 'アップストリーム事業者', value: '9' },
      { label: '24 時間稼働率', value: '99.94%' },
      { label: '平均レイテンシー', value: '1.2s' },
    ],
    reliability: {
      eyebrow: '信頼性',
      title: '公式アカウントプールを自前で構築し、自動フェイルオーバー',
      description:
        '各モデルの背後には複数の公式アカウントがあり、失敗時には次のアカウントへ自動的に再試行します。クライアント側の設定は不要です。',
      linkLabel: '障害復旧の仕組みを見る →',
    },
    status: {
      title: 'リアルタイムのモデルステータス',
      legend: ['正常', '遅延', '障害'],
      note: '各四角は監視中のモデルです。ホバーすると詳細を確認できます',
    },
  },
  vi: {
    heroTitle: ['API LLM cấp doanh nghiệp,', 'sẵn sàng dùng ngay'],
    badge: 'Gateway thống nhất · 85+ mô hình · 9 nhà cung cấp',
    stats: [
      { label: 'Mô hình đang cung cấp', value: '85+' },
      { label: 'Nhà cung cấp phía trên', value: '9' },
      { label: 'Tỷ lệ sẵn sàng 24h', value: '99.94%' },
      { label: 'Độ trễ trung bình', value: '1.2s' },
    ],
    reliability: {
      eyebrow: 'Độ tin cậy',
      title: 'Tự xây dựng pool tài khoản chính thức, tự động chuyển đổi dự phòng',
      description:
        'Mỗi mô hình có nhiều tài khoản chính thức phía sau; khi một tài khoản lỗi, hệ thống tự động thử tài khoản tiếp theo, không cần cấu hình gì ở phía client.',
      linkLabel: 'Tìm hiểu cơ chế chịu lỗi →',
    },
    status: {
      title: 'Trạng thái mô hình thời gian thực',
      legend: ['Bình thường', 'Chậm', 'Lỗi'],
      note: 'Mỗi ô vuông là một mô hình đang được theo dõi; di chuột để xem chi tiết',
    },
  },
  'zh-TW': {
    heroTitle: ['企業級 LLM API', '閘道，開箱即用'],
    badge: '統一閘道 · 85+ 模型 · 9 家廠商',
    stats: [
      { label: '在售模型', value: '85+' },
      { label: '上游廠商', value: '9' },
      { label: '24h 可用率', value: '99.94%' },
      { label: '平均延遲', value: '1.2s' },
    ],
    reliability: {
      eyebrow: '可靠性',
      title: '自建官方帳號池，自動故障切換',
      description: '每個模型背後有多個官方帳號；失敗時自動重試下一個，客戶端無需任何設定。',
      linkLabel: '瞭解容災機制 →',
    },
    status: {
      title: '即時模型狀態',
      legend: ['正常', '緩慢', '故障'],
      note: '每個方塊 = 一個在測模型，將游標移入查看詳情',
    },
  },
};
