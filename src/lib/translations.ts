import type { Locale } from './i18n';

/**
 * fumadocs UI 的多语言词表。
 *
 * fumadocs（@fumadocs/base-ui）不内置任何语言包，全部文案自己提供；
 * 通过 AppI18nProvider 的 I18nProvider.translations 按当前语言下发。
 * en 不需要词表：fumadocs 默认文案即英文。
 *
 * 键名规则（来自 @fuma-translate/react 的 encodeKey）：原文 + 每个 note 用括号拼接，
 * 例如 t("Open Search", { note: "search trigger" }) 再叠一层 aria-label，
 * 最终键是 "Open Search(search trigger)(aria-label)"。漏掉任何一层 note 都会静默失效。
 *
 * 权威键清单见 node_modules/fumadocs-ui/dist/.translations/index.d.ts，
 * 升级 fumadocs 后请重新对照，避免键名漂移导致翻译失效。
 */
export const zhTranslations: Record<string, string> = {
  displayName: '简体中文',

  // ── 搜索 ──
  'Search(search trigger)': '搜索文档',
  'Search(search dialog)': '搜索文档',
  'Open Search(search trigger)(aria-label)': '打开搜索',
  'Close Search(search dialog)(aria-label)': '关闭搜索',
  'No results found(search dialog)': '没有找到结果',
  'Search failed(search dialog)': '搜索失败',
  'Search failed, showing results for {query}(search dialog)': '搜索失败，显示「{query}」的结果',

  // ── 主题切换 ──
  'Toggle Theme(theme switcher)(aria-label)': '切换主题',
  'Light(theme switcher)(aria-label)': '浅色',
  'Dark(theme switcher)(aria-label)': '深色',
  'System(theme switcher)(aria-label)': '跟随系统',
  'Theme(site menu)': '主题',

  // ── 侧边栏与导航 ──
  'Toggle Menu(home layout header)(aria-label)': '切换菜单',
  'Show Sidebar(sidebar)': '显示侧边栏',
  'Hide Sidebar(sidebar)': '隐藏侧边栏',
  'Open Sidebar(aria-label)': '展开侧边栏',
  'Open Sidebar(sidebar)(aria-label)': '展开侧边栏',
  'Close Sidebar(aria-label)': '收起侧边栏',
  'Close Sidebar(sidebar)(aria-label)': '收起侧边栏',
  'Collapse Sidebar(sidebar)(aria-label)': '收起侧边栏',

  // ── 目录 ──
  'Table of Contents(inline table of contents)': '目录',
  'On this page(table of contents)': '本页内容',
  'No Headings(table of contents)': '暂无标题',

  // ── 页面操作 ──
  'Copy Markdown(page actions)': '复制 Markdown',
  'Copied Markdown(page actions)': '已复制 Markdown',
  'View as Markdown(page actions)': '查看 Markdown',
  'Edit on GitHub(edit page)': '在 GitHub 上编辑',
  'Last updated on(page footer)': '最后更新于',
  'Open(page actions)': '打开',
  'Open in GitHub(page actions)': '在 GitHub 中打开',
  'Open in ChatGPT(page actions)': '在 ChatGPT 中打开',
  'Open in Claude(page actions)': '在 Claude 中打开',
  'Open in Cursor(page actions)': '在 Cursor 中打开',
  'Open in Scira AI(page actions)': '在 Scira AI 中打开',
  'Read {url}, I want to ask questions about it.(page actions)':
    '阅读 {url}，我想就它提问。',

  // ── 代码块与折叠块 ──
  'Copy Text(code block)(aria-label)': '复制',
  'Copied Text(code block)(aria-label)': '已复制',
  'Copy Link(accordion)(aria-label)': '复制链接',
  'Copied Link(accordion)(aria-label)': '已复制链接',

  // ── 标题锚点 ──
  'Copy Anchor Link(heading anchor)(aria-label)': '复制锚点链接',
  'Copied Anchor Link(heading anchor)(aria-label)': '已复制锚点链接',

  // ── 图片查看 ──
  'Image Viewer(image zoom)(aria-label)': '图片查看器',
  'Close(image zoom)(aria-label)': '关闭',
  'Previous Image(image zoom)(aria-label)': '上一张',
  'Next Image(image zoom)(aria-label)': '下一张',

  // ── 分页 ──
  'Previous Page(pagination)': '上一页',
  'Next Page(pagination)': '下一页',

  // ── 404 ──
  'Page Not Found(404 not found page)': '页面不存在',
  'Back to Home(404 not found page)': '返回首页',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
    '你访问的页面可能已被移除、更名或暂时不可用。',

  // ── 语言切换 ──
  'Choose a language(language switcher)': '选择语言',
  'Language(language switcher)': '语言',
  'Close Banner(banner)(aria-label)': '关闭横幅',

  // ── 其他 ──
  'Skip to Content(skip link)': '跳到正文',
  'Layout Tab(layout tab trigger)': '布局',
  'Options(aria-label)': '选项',
  'Ask AI(AI chat button)': '向 AI 提问',
};

const frTranslations: Record<string, string> = {
  displayName: 'Français',

  // ── Recherche ──
  'Search(search trigger)': 'Rechercher dans la doc',
  'Search(search dialog)': 'Rechercher dans la doc',
  'Open Search(search trigger)(aria-label)': 'Ouvrir la recherche',
  'Close Search(search dialog)(aria-label)': 'Fermer la recherche',
  'No results found(search dialog)': 'Aucun résultat',
  'Search failed(search dialog)': 'Échec de la recherche',
  'Search failed, showing results for {query}(search dialog)':
    'Échec de la recherche, résultats pour « {query} »',

  // ── Thème ──
  'Toggle Theme(theme switcher)(aria-label)': 'Changer de thème',
  'Light(theme switcher)(aria-label)': 'Clair',
  'Dark(theme switcher)(aria-label)': 'Sombre',
  'System(theme switcher)(aria-label)': 'Système',
  'Theme(site menu)': 'Thème',

  // ── Barre latérale et navigation ──
  'Toggle Menu(home layout header)(aria-label)': 'Basculer le menu',
  'Show Sidebar(sidebar)': 'Afficher la barre latérale',
  'Hide Sidebar(sidebar)': 'Masquer la barre latérale',
  'Open Sidebar(aria-label)': 'Ouvrir la barre latérale',
  'Open Sidebar(sidebar)(aria-label)': 'Ouvrir la barre latérale',
  'Close Sidebar(aria-label)': 'Fermer la barre latérale',
  'Close Sidebar(sidebar)(aria-label)': 'Fermer la barre latérale',
  'Collapse Sidebar(sidebar)(aria-label)': 'Réduire la barre latérale',

  // ── Sommaire ──
  'Table of Contents(inline table of contents)': 'Table des matières',
  'On this page(table of contents)': 'Sur cette page',
  'No Headings(table of contents)': 'Aucun titre',

  // ── Actions de page ──
  'Copy Markdown(page actions)': 'Copier en Markdown',
  'Copied Markdown(page actions)': 'Markdown copié',
  'View as Markdown(page actions)': 'Voir en Markdown',
  'Edit on GitHub(edit page)': 'Modifier sur GitHub',
  'Last updated on(page footer)': 'Dernière mise à jour le',
  'Open(page actions)': 'Ouvrir',
  'Open in GitHub(page actions)': 'Ouvrir dans GitHub',
  'Open in ChatGPT(page actions)': 'Ouvrir dans ChatGPT',
  'Open in Claude(page actions)': 'Ouvrir dans Claude',
  'Open in Cursor(page actions)': 'Ouvrir dans Cursor',
  'Open in Scira AI(page actions)': 'Ouvrir dans Scira AI',
  'Read {url}, I want to ask questions about it.(page actions)':
    'Lire {url}, je souhaite poser des questions à son sujet.',

  // ── Blocs de code ──
  'Copy Text(code block)(aria-label)': 'Copier',
  'Copied Text(code block)(aria-label)': 'Copié',
  'Copy Link(accordion)(aria-label)': 'Copier le lien',
  'Copied Link(accordion)(aria-label)': 'Lien copié',

  // ── Ancres ──
  'Copy Anchor Link(heading anchor)(aria-label)': 'Copier le lien d’ancre',
  'Copied Anchor Link(heading anchor)(aria-label)': 'Lien d’ancre copié',

  // ── Visionneuse d'images ──
  'Image Viewer(image zoom)(aria-label)': 'Visionneuse d’images',
  'Close(image zoom)(aria-label)': 'Fermer',
  'Previous Image(image zoom)(aria-label)': 'Image précédente',
  'Next Image(image zoom)(aria-label)': 'Image suivante',

  // ── Pagination ──
  'Previous Page(pagination)': 'Page précédente',
  'Next Page(pagination)': 'Page suivante',

  // ── 404 ──
  'Page Not Found(404 not found page)': 'Page introuvable',
  'Back to Home(404 not found page)': 'Retour à l’accueil',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
    'La page que vous cherchez a peut-être été supprimée, renommée ou est temporairement indisponible.',

  // ── Sélecteur de langue ──
  'Choose a language(language switcher)': 'Choisir une langue',
  'Language(language switcher)': 'Langue',
  'Close Banner(banner)(aria-label)': 'Fermer la bannière',

  // ── Divers ──
  'Skip to Content(skip link)': 'Aller au contenu',
  'Layout Tab(layout tab trigger)': 'Onglet de mise en page',
  'Options(aria-label)': 'Options',
  'Ask AI(AI chat button)': 'Demander à l’IA',
};

const ruTranslations: Record<string, string> = {
  displayName: 'Русский',

  // ── Поиск ──
  'Search(search trigger)': 'Поиск по документации',
  'Search(search dialog)': 'Поиск по документации',
  'Open Search(search trigger)(aria-label)': 'Открыть поиск',
  'Close Search(search dialog)(aria-label)': 'Закрыть поиск',
  'No results found(search dialog)': 'Ничего не найдено',
  'Search failed(search dialog)': 'Ошибка поиска',
  'Search failed, showing results for {query}(search dialog)':
    'Ошибка поиска, показаны результаты для «{query}»',

  // ── Тема ──
  'Toggle Theme(theme switcher)(aria-label)': 'Переключить тему',
  'Light(theme switcher)(aria-label)': 'Светлая',
  'Dark(theme switcher)(aria-label)': 'Тёмная',
  'System(theme switcher)(aria-label)': 'Системная',
  'Theme(site menu)': 'Тема',

  // ── Боковая панель и навигация ──
  'Toggle Menu(home layout header)(aria-label)': 'Переключить меню',
  'Show Sidebar(sidebar)': 'Показать боковую панель',
  'Hide Sidebar(sidebar)': 'Скрыть боковую панель',
  'Open Sidebar(aria-label)': 'Открыть боковую панель',
  'Open Sidebar(sidebar)(aria-label)': 'Открыть боковую панель',
  'Close Sidebar(aria-label)': 'Закрыть боковую панель',
  'Close Sidebar(sidebar)(aria-label)': 'Закрыть боковую панель',
  'Collapse Sidebar(sidebar)(aria-label)': 'Свернуть боковую панель',

  // ── Содержание ──
  'Table of Contents(inline table of contents)': 'Содержание',
  'On this page(table of contents)': 'На этой странице',
  'No Headings(table of contents)': 'Нет заголовков',

  // ── Действия страницы ──
  'Copy Markdown(page actions)': 'Скопировать Markdown',
  'Copied Markdown(page actions)': 'Markdown скопирован',
  'View as Markdown(page actions)': 'Открыть как Markdown',
  'Edit on GitHub(edit page)': 'Править на GitHub',
  'Last updated on(page footer)': 'Обновлено',
  'Open(page actions)': 'Открыть',
  'Open in GitHub(page actions)': 'Открыть на GitHub',
  'Open in ChatGPT(page actions)': 'Открыть в ChatGPT',
  'Open in Claude(page actions)': 'Открыть в Claude',
  'Open in Cursor(page actions)': 'Открыть в Cursor',
  'Open in Scira AI(page actions)': 'Открыть в Scira AI',
  'Read {url}, I want to ask questions about it.(page actions)':
    'Прочитай {url}, я хочу задать по нему вопросы.',

  // ── Блоки кода ──
  'Copy Text(code block)(aria-label)': 'Копировать',
  'Copied Text(code block)(aria-label)': 'Скопировано',
  'Copy Link(accordion)(aria-label)': 'Копировать ссылку',
  'Copied Link(accordion)(aria-label)': 'Ссылка скопирована',

  // ── Якоря ──
  'Copy Anchor Link(heading anchor)(aria-label)': 'Копировать ссылку на якорь',
  'Copied Anchor Link(heading anchor)(aria-label)': 'Ссылка на якорь скопирована',

  // ── Просмотр изображений ──
  'Image Viewer(image zoom)(aria-label)': 'Просмотр изображений',
  'Close(image zoom)(aria-label)': 'Закрыть',
  'Previous Image(image zoom)(aria-label)': 'Предыдущее изображение',
  'Next Image(image zoom)(aria-label)': 'Следующее изображение',

  // ── Пагинация ──
  'Previous Page(pagination)': 'Назад',
  'Next Page(pagination)': 'Вперёд',

  // ── 404 ──
  'Page Not Found(404 not found page)': 'Страница не найдена',
  'Back to Home(404 not found page)': 'На главную',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
    'Возможно, страница была удалена, переименована или временно недоступна.',

  // ── Переключатель языка ──
  'Choose a language(language switcher)': 'Выберите язык',
  'Language(language switcher)': 'Язык',
  'Close Banner(banner)(aria-label)': 'Закрыть баннер',

  // ── Прочее ──
  'Skip to Content(skip link)': 'Перейти к содержимому',
  'Layout Tab(layout tab trigger)': 'Вкладка макета',
  'Options(aria-label)': 'Параметры',
  'Ask AI(AI chat button)': 'Спросить ИИ',
};

const jaTranslations: Record<string, string> = {
  displayName: '日本語',

  // ── 検索 ──
  'Search(search trigger)': 'ドキュメントを検索',
  'Search(search dialog)': 'ドキュメントを検索',
  'Open Search(search trigger)(aria-label)': '検索を開く',
  'Close Search(search dialog)(aria-label)': '検索を閉じる',
  'No results found(search dialog)': '結果が見つかりません',
  'Search failed(search dialog)': '検索に失敗しました',
  'Search failed, showing results for {query}(search dialog)':
    '検索に失敗しました。「{query}」の結果を表示します',

  // ── テーマ ──
  'Toggle Theme(theme switcher)(aria-label)': 'テーマを切り替える',
  'Light(theme switcher)(aria-label)': 'ライト',
  'Dark(theme switcher)(aria-label)': 'ダーク',
  'System(theme switcher)(aria-label)': 'システムに従う',
  'Theme(site menu)': 'テーマ',

  // ── サイドバーとナビゲーション ──
  'Toggle Menu(home layout header)(aria-label)': 'メニューを切り替える',
  'Show Sidebar(sidebar)': 'サイドバーを表示',
  'Hide Sidebar(sidebar)': 'サイドバーを隠す',
  'Open Sidebar(aria-label)': 'サイドバーを開く',
  'Open Sidebar(sidebar)(aria-label)': 'サイドバーを開く',
  'Close Sidebar(aria-label)': 'サイドバーを閉じる',
  'Close Sidebar(sidebar)(aria-label)': 'サイドバーを閉じる',
  'Collapse Sidebar(sidebar)(aria-label)': 'サイドバーを折りたたむ',

  // ── 目次 ──
  'Table of Contents(inline table of contents)': '目次',
  'On this page(table of contents)': 'このページの内容',
  'No Headings(table of contents)': '見出しがありません',

  // ── ページ操作 ──
  'Copy Markdown(page actions)': 'Markdown をコピー',
  'Copied Markdown(page actions)': 'Markdown をコピーしました',
  'View as Markdown(page actions)': 'Markdown で表示',
  'Edit on GitHub(edit page)': 'GitHub で編集',
  'Last updated on(page footer)': '最終更新',
  'Open(page actions)': '開く',
  'Open in GitHub(page actions)': 'GitHub で開く',
  'Open in ChatGPT(page actions)': 'ChatGPT で開く',
  'Open in Claude(page actions)': 'Claude で開く',
  'Open in Cursor(page actions)': 'Cursor で開く',
  'Open in Scira AI(page actions)': 'Scira AI で開く',
  'Read {url}, I want to ask questions about it.(page actions)':
    '{url} を読んで、それについて質問してください。',

  // ── コードブロック ──
  'Copy Text(code block)(aria-label)': 'コピー',
  'Copied Text(code block)(aria-label)': 'コピーしました',
  'Copy Link(accordion)(aria-label)': 'リンクをコピー',
  'Copied Link(accordion)(aria-label)': 'リンクをコピーしました',

  // ── アンカー ──
  'Copy Anchor Link(heading anchor)(aria-label)': 'アンカーリンクをコピー',
  'Copied Anchor Link(heading anchor)(aria-label)': 'アンカーリンクをコピーしました',

  // ── 画像ビューア ──
  'Image Viewer(image zoom)(aria-label)': '画像ビューア',
  'Close(image zoom)(aria-label)': '閉じる',
  'Previous Image(image zoom)(aria-label)': '前の画像',
  'Next Image(image zoom)(aria-label)': '次の画像',

  // ── ページ送り ──
  'Previous Page(pagination)': '前のページ',
  'Next Page(pagination)': '次のページ',

  // ── 404 ──
  'Page Not Found(404 not found page)': 'ページが見つかりません',
  'Back to Home(404 not found page)': 'ホームに戻る',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
    'お探しのページは削除されたか、名前が変更されたか、一時的に利用できない可能性があります。',

  // ── 言語切り替え ──
  'Choose a language(language switcher)': '言語を選択',
  'Language(language switcher)': '言語',
  'Close Banner(banner)(aria-label)': 'バナーを閉じる',

  // ── その他 ──
  'Skip to Content(skip link)': '本文へスキップ',
  'Layout Tab(layout tab trigger)': 'レイアウトタブ',
  'Options(aria-label)': 'オプション',
  'Ask AI(AI chat button)': 'AI に質問',
};

const viTranslations: Record<string, string> = {
  displayName: 'Tiếng Việt',

  // ── Tìm kiếm ──
  'Search(search trigger)': 'Tìm kiếm tài liệu',
  'Search(search dialog)': 'Tìm kiếm tài liệu',
  'Open Search(search trigger)(aria-label)': 'Mở tìm kiếm',
  'Close Search(search dialog)(aria-label)': 'Đóng tìm kiếm',
  'No results found(search dialog)': 'Không tìm thấy kết quả',
  'Search failed(search dialog)': 'Tìm kiếm thất bại',
  'Search failed, showing results for {query}(search dialog)':
    'Tìm kiếm thất bại, hiển thị kết quả cho “{query}”',

  // ── Chủ đề ──
  'Toggle Theme(theme switcher)(aria-label)': 'Đổi chủ đề',
  'Light(theme switcher)(aria-label)': 'Sáng',
  'Dark(theme switcher)(aria-label)': 'Tối',
  'System(theme switcher)(aria-label)': 'Theo hệ thống',
  'Theme(site menu)': 'Chủ đề',

  // ── Thanh bên và điều hướng ──
  'Toggle Menu(home layout header)(aria-label)': 'Bật/tắt menu',
  'Show Sidebar(sidebar)': 'Hiện thanh bên',
  'Hide Sidebar(sidebar)': 'Ẩn thanh bên',
  'Open Sidebar(aria-label)': 'Mở thanh bên',
  'Open Sidebar(sidebar)(aria-label)': 'Mở thanh bên',
  'Close Sidebar(aria-label)': 'Đóng thanh bên',
  'Close Sidebar(sidebar)(aria-label)': 'Đóng thanh bên',
  'Collapse Sidebar(sidebar)(aria-label)': 'Thu gọn thanh bên',

  // ── Mục lục ──
  'Table of Contents(inline table of contents)': 'Mục lục',
  'On this page(table of contents)': 'Trên trang này',
  'No Headings(table of contents)': 'Không có tiêu đề',

  // ── Thao tác trang ──
  'Copy Markdown(page actions)': 'Sao chép Markdown',
  'Copied Markdown(page actions)': 'Đã sao chép Markdown',
  'View as Markdown(page actions)': 'Xem dưới dạng Markdown',
  'Edit on GitHub(edit page)': 'Sửa trên GitHub',
  'Last updated on(page footer)': 'Cập nhật lần cuối',
  'Open(page actions)': 'Mở',
  'Open in GitHub(page actions)': 'Mở trong GitHub',
  'Open in ChatGPT(page actions)': 'Mở trong ChatGPT',
  'Open in Claude(page actions)': 'Mở trong Claude',
  'Open in Cursor(page actions)': 'Mở trong Cursor',
  'Open in Scira AI(page actions)': 'Mở trong Scira AI',
  'Read {url}, I want to ask questions about it.(page actions)':
    'Đọc {url}, tôi muốn đặt câu hỏi về nó.',

  // ── Khối mã ──
  'Copy Text(code block)(aria-label)': 'Sao chép',
  'Copied Text(code block)(aria-label)': 'Đã sao chép',
  'Copy Link(accordion)(aria-label)': 'Sao chép liên kết',
  'Copied Link(accordion)(aria-label)': 'Đã sao chép liên kết',

  // ── Neo ──
  'Copy Anchor Link(heading anchor)(aria-label)': 'Sao chép liên kết neo',
  'Copied Anchor Link(heading anchor)(aria-label)': 'Đã sao chép liên kết neo',

  // ── Trình xem ảnh ──
  'Image Viewer(image zoom)(aria-label)': 'Trình xem hình ảnh',
  'Close(image zoom)(aria-label)': 'Đóng',
  'Previous Image(image zoom)(aria-label)': 'Ảnh trước',
  'Next Image(image zoom)(aria-label)': 'Ảnh sau',

  // ── Phân trang ──
  'Previous Page(pagination)': 'Trang trước',
  'Next Page(pagination)': 'Trang sau',

  // ── 404 ──
  'Page Not Found(404 not found page)': 'Không tìm thấy trang',
  'Back to Home(404 not found page)': 'Về trang chủ',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
    'Trang bạn tìm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.',

  // ── Chọn ngôn ngữ ──
  'Choose a language(language switcher)': 'Chọn ngôn ngữ',
  'Language(language switcher)': 'Ngôn ngữ',
  'Close Banner(banner)(aria-label)': 'Đóng banner',

  // ── Khác ──
  'Skip to Content(skip link)': 'Tới nội dung',
  'Layout Tab(layout tab trigger)': 'Tab bố cục',
  'Options(aria-label)': 'Tùy chọn',
  'Ask AI(AI chat button)': 'Hỏi AI',
};

const zhTwTranslations: Record<string, string> = {
  displayName: '繁體中文',

  // ── 搜尋 ──
  'Search(search trigger)': '搜尋文件',
  'Search(search dialog)': '搜尋文件',
  'Open Search(search trigger)(aria-label)': '開啟搜尋',
  'Close Search(search dialog)(aria-label)': '關閉搜尋',
  'No results found(search dialog)': '沒有找到結果',
  'Search failed(search dialog)': '搜尋失敗',
  'Search failed, showing results for {query}(search dialog)': '搜尋失敗，顯示「{query}」的結果',

  // ── 主題切換 ──
  'Toggle Theme(theme switcher)(aria-label)': '切換主題',
  'Light(theme switcher)(aria-label)': '淺色',
  'Dark(theme switcher)(aria-label)': '深色',
  'System(theme switcher)(aria-label)': '跟隨系統',
  'Theme(site menu)': '主題',

  // ── 側邊欄與導覽 ──
  'Toggle Menu(home layout header)(aria-label)': '切換選單',
  'Show Sidebar(sidebar)': '顯示側邊欄',
  'Hide Sidebar(sidebar)': '隱藏側邊欄',
  'Open Sidebar(aria-label)': '展開側邊欄',
  'Open Sidebar(sidebar)(aria-label)': '展開側邊欄',
  'Close Sidebar(aria-label)': '收合側邊欄',
  'Close Sidebar(sidebar)(aria-label)': '收合側邊欄',
  'Collapse Sidebar(sidebar)(aria-label)': '收合側邊欄',

  // ── 目錄 ──
  'Table of Contents(inline table of contents)': '目錄',
  'On this page(table of contents)': '本頁內容',
  'No Headings(table of contents)': '暫無標題',

  // ── 頁面操作 ──
  'Copy Markdown(page actions)': '複製 Markdown',
  'Copied Markdown(page actions)': '已複製 Markdown',
  'View as Markdown(page actions)': '檢視 Markdown',
  'Edit on GitHub(edit page)': '在 GitHub 上編輯',
  'Last updated on(page footer)': '最後更新於',
  'Open(page actions)': '開啟',
  'Open in GitHub(page actions)': '在 GitHub 中開啟',
  'Open in ChatGPT(page actions)': '在 ChatGPT 中開啟',
  'Open in Claude(page actions)': '在 Claude 中開啟',
  'Open in Cursor(page actions)': '在 Cursor 中開啟',
  'Open in Scira AI(page actions)': '在 Scira AI 中開啟',
  'Read {url}, I want to ask questions about it.(page actions)': '閱讀 {url}，我想就它提問。',

  // ── 程式碼區塊 ──
  'Copy Text(code block)(aria-label)': '複製',
  'Copied Text(code block)(aria-label)': '已複製',
  'Copy Link(accordion)(aria-label)': '複製連結',
  'Copied Link(accordion)(aria-label)': '已複製連結',

  // ── 錨點 ──
  'Copy Anchor Link(heading anchor)(aria-label)': '複製錨點連結',
  'Copied Anchor Link(heading anchor)(aria-label)': '已複製錨點連結',

  // ── 圖片檢視 ──
  'Image Viewer(image zoom)(aria-label)': '圖片檢視器',
  'Close(image zoom)(aria-label)': '關閉',
  'Previous Image(image zoom)(aria-label)': '上一張',
  'Next Image(image zoom)(aria-label)': '下一張',

  // ── 翻頁 ──
  'Previous Page(pagination)': '上一頁',
  'Next Page(pagination)': '下一頁',

  // ── 404 ──
  'Page Not Found(404 not found page)': '頁面不存在',
  'Back to Home(404 not found page)': '返回首頁',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
    '你造訪的頁面可能已被移除、更名或暫時不可用。',

  // ── 語言切換 ──
  'Choose a language(language switcher)': '選擇語言',
  'Language(language switcher)': '語言',
  'Close Banner(banner)(aria-label)': '關閉橫幅',

  // ── 其他 ──
  'Skip to Content(skip link)': '跳到內文',
  'Layout Tab(layout tab trigger)': '版面配置',
  'Options(aria-label)': '選項',
  'Ask AI(AI chat button)': '問問 AI',
};

/** fumadocs 默认文案即英文，en 无需词表 */
export const uiTranslations: Record<Locale, Record<string, string>> = {
  zh: zhTranslations,
  en: {},
  fr: frTranslations,
  ru: ruTranslations,
  ja: jaTranslations,
  vi: viTranslations,
  'zh-TW': zhTwTranslations,
};
