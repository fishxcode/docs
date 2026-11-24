import type { Locale } from './i18n';

interface NotFoundCopy {
  eyebrow: string;
  title: string;
  description: string;
  backHome: string;
  searchDocs: string;
  viewStatus: string;
}

export const NOT_FOUND_COPY: Record<Locale, NotFoundCopy> = {
  zh: {
    eyebrow: '文档导航',
    title: '页面不存在',
    description: '你访问的页面可能已被移除、更名或暂时不可用。你可以返回首页、搜索文档，或查看服务状态。',
    backHome: '返回首页',
    searchDocs: '搜索文档',
    viewStatus: '查看状态',
  },
  en: {
    eyebrow: 'Documentation',
    title: 'Page not found',
    description: 'The page you are looking for may have been removed, renamed, or temporarily unavailable. You can return home, search the docs, or check service status.',
    backHome: 'Back to home',
    searchDocs: 'Search docs',
    viewStatus: 'View status',
  },
  fr: {
    eyebrow: 'Documentation',
    title: 'Page introuvable',
    description: 'La page que vous recherchez a peut-être été supprimée, renommée ou est temporairement indisponible. Vous pouvez retourner à l’accueil, rechercher dans la documentation ou consulter l’état du service.',
    backHome: 'Retour à l’accueil',
    searchDocs: 'Rechercher',
    viewStatus: 'État du service',
  },
  es: {
    eyebrow: 'Documentación',
    title: 'Página no encontrada',
    description: 'La página que buscas puede haber sido eliminada, renombrada o estar temporalmente no disponible. Puedes volver al inicio, buscar en la documentación o consultar el estado del servicio.',
    backHome: 'Volver al inicio',
    searchDocs: 'Buscar documentación',
    viewStatus: 'Ver estado',
  },
  pt: {
    eyebrow: 'Documentação',
    title: 'Página não encontrada',
    description: 'A página que você procura pode ter sido removida, renomeada ou estar temporariamente indisponível. Você pode voltar ao início, pesquisar a documentação ou verificar o status do serviço.',
    backHome: 'Voltar ao início',
    searchDocs: 'Pesquisar documentação',
    viewStatus: 'Ver status',
  },
  ru: {
    eyebrow: 'Документация',
    title: 'Страница не найдена',
    description: 'Возможно, страница была удалена, переименована или временно недоступна. Вернитесь на главную, выполните поиск по документации или проверьте состояние сервиса.',
    backHome: 'На главную',
    searchDocs: 'Поиск документации',
    viewStatus: 'Состояние сервиса',
  },
  ja: {
    eyebrow: 'ドキュメント',
    title: 'ページが見つかりません',
    description: 'お探しのページは削除されたか、名前が変更されたか、一時的に利用できない可能性があります。ホームに戻る、ドキュメントを検索する、サービス状況を確認するなどできます。',
    backHome: 'ホームに戻る',
    searchDocs: 'ドキュメントを検索',
    viewStatus: 'サービス状況',
  },
  vi: {
    eyebrow: 'Tài liệu',
    title: 'Không tìm thấy trang',
    description: 'Trang bạn tìm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng. Bạn có thể về trang chủ, tìm kiếm tài liệu hoặc kiểm tra trạng thái dịch vụ.',
    backHome: 'Về trang chủ',
    searchDocs: 'Tìm kiếm tài liệu',
    viewStatus: 'Xem trạng thái',
  },
  'zh-TW': {
    eyebrow: '文件導覽',
    title: '頁面不存在',
    description: '你造訪的頁面可能已被移除、更名或暫時無法使用。你可以返回首頁、搜尋文件，或查看服務狀態。',
    backHome: '返回首頁',
    searchDocs: '搜尋文件',
    viewStatus: '查看狀態',
  },
};
