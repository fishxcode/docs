import {
  DEFAULT_LOCALE,
  HTML_LANG,
  isTranslatedPage,
  localePath,
  type Locale,
} from '@/lib/i18n';
import { getDocCanonicalUrl, getPageImageUrl, getResourcePage, source } from '@/lib/source';
import { getContentDates } from '@/lib/content-dates';
import { siteConfig } from '@/lib/site';
import { HOME_COPY } from '@/lib/home-copy';

/**
 * JSON-LD 的唯一构造点。
 *
 * 两类节点分开：
 * - 站点级（Organization / WebSite / SoftwareApplication）：每个页面都输出，
 *   同一份 `@id` 让 AI 与搜索把各语言页面聚合成同一个实体；
 * - 文档级（TechArticle / BreadcrumbList，以及正文确有对应结构时的 FAQPage /
 *   HowTo）：只有文档页输出，抽不到结构就整节点省略，绝不凭空编造。
 *
 * 静态导出下所有值在构建期算好，不存在运行时请求。
 * 只输出能够从本仓库确认的事实：没有 logo 素材、社交账号、联系邮箱与文档许可，
 * 这些节点一律不写，等确认后再补。
 */

type DocPage = (typeof source)['$inferPage'];

/** 组织节点的稳定标识：全站页面的 publisher / author 都指向它 */
const ORGANIZATION_ID = `${siteConfig.url}/#organization`;

/** 整篇即一份完整上手流程的页面，才值得输出 HowTo */
const HOWTO_SLUGS = new Set(['quickstart']);

/**
 * 问句标题的判定。
 *
 * 中文标题大量省略问号（「中转站是什么」「API Key 安全吗」），只认问号会
 * 把大半问答漏掉，所以三种形态都认：问号结尾、疑问词开头、疑问结构收尾。
 * 宽松匹配的误判由调用方的"至少两条"门槛兜住——单个陈述句被当成问题
 * 不会产出 FAQPage。
 */
const QUESTION_PREFIX =
  /^(如何|怎么|怎样|为什么|为何|什么是|什么|是否|能否|可以|要不要|该不该|哪里|哪些|\bhow\b|\bwhat\b|\bwhy\b|\bwhich\b|\bwhen\b|\bcan\b|\bshould\b|\bdo\b|\bdoes\b|\bis\b|comment\b|pourquoi\b|qu[e']|как\b|почему\b|стоит ли|можно ли|làm sao|tại sao|có nên)/i;

/** 疑问结构必须落在句尾：出现在句中的"在哪里"是叙述，不是提问。 */
const QUESTION_INLINE =
  /(是什么|有什么区别|什么区别|怎么办|怎么做|怎么处理|怎么用|怎么选|怎么验证|怎么判断|怎么配置|多久|多少|在谁|从哪里开始|从哪里|在哪里|从哪|在哪|是否|哪些|哪个|为什么|如何|吗|呢)\s*[？?]?\s*$/;

const STEP_HEADING = /^(?:步骤|Step|Étape|Шаг|Bước)\s*(\d+)\s*[：:.、\-—]?\s*(.+)$/i;

function absolute(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

/** 当前页面正文所属语言：回退页的正文其实是默认语言 */
export function contentLocaleOf(page: DocPage, lang: Locale): Locale {
  return isTranslatedPage(page, lang) ? lang : DEFAULT_LOCALE;
}

/** Organization：跨页共用同一 `@id`，AI 侧才能聚合成同一实体 */
export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: siteConfig.productName,
    url: siteConfig.productUrl,
    description: HOME_COPY[DEFAULT_LOCALE].description,
  };
}

/**
 * WebSite：`url` 与 `inLanguage` 跟随当前语言版本。
 * 每个语言一个独立 `@id`，不把英文页声明成中文站。
 */
export function websiteNode(lang: Locale) {
  const homeUrl = absolute(localePath(lang, '/'));

  return {
    '@type': 'WebSite',
    '@id': `${homeUrl}#website`,
    name: HOME_COPY[lang].title,
    url: homeUrl,
    description: HOME_COPY[lang].description,
    inLanguage: HTML_LANG[lang],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/**
 * SoftwareApplication：描述中转服务本身，`url` 指向服务所在的站点。
 *
 * 不输出 offers——价格随接口实时变化，构建期拿不到可靠数字，写死任何一个
 * 价格都会变成过期事实。
 */
export function softwareApplicationNode(lang: Locale) {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${siteConfig.productUrl}#app`,
    name: siteConfig.productName,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    url: siteConfig.productUrl,
    description: HOME_COPY[lang].description,
    inLanguage: HTML_LANG[lang],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/**
 * 文档页所在分类的名称（articleSection）。
 *
 * 取该语言 `meta.json` 里目录的标题：既保证多语言正确，又不用在代码里
 * 硬编码任何语言的文案。逐层下钻，命中最近一层带标题的文件夹即返回；
 * 顶层页没有分类，返回 undefined。
 */
function sectionNameOf(page: DocPage, contentLocale: Locale): string | undefined {
  if (page.slugs.length === 0) return undefined;
  // 目录标题只服务导航，页树节点不带 slugs，只能按 url 比对：
  // 用该深度父页的 url 判断当前页落在哪个文件夹下。
  let nodes = source.getPageTree(contentLocale).children;
  let name: string | undefined;

  for (let depth = 0; depth < page.slugs.length; depth += 1) {
    const wanted = source.getPage(page.slugs.slice(0, depth + 1), contentLocale)?.url;
    if (!wanted) break;

    const folder = nodes.find((node) => {
      if (node.type !== 'folder') return false;
      const pages = node.index ? [node.index, ...node.children] : node.children;
      return pages.some((child) => child.type === 'page' && child.url === wanted);
    });
    if (folder?.type !== 'folder') break;

    // folder.name 是 ReactNode，只有字符串才能进 JSON-LD
    if (typeof folder.name === 'string' && folder.name.trim()) name = folder.name.trim();
    nodes = folder.children;
  }

  return name;
}

/**
 * `structuredData.headings` 把标题原文映射到锚点 id，`contents[].heading` 存的
 * 是这个 id（`"步骤-1注册账户"`）而不是原文——标点被去掉、空格换成连字符，
 * 直接拿它做问句/编号判定会全部落空。
 */
function headingTextMap(page: DocPage): Map<string, string> {
  return new Map((page.data.structuredData?.headings ?? []).map(({ id, content }) => [id, content]));
}

/**
 * 从正文抽取问答对。
 *
 * 数据源是 fumadocs 在构建期生成的 `structuredData.contents`（标题 + 其下的
 * 正文段落）。只认"标题本身是问句"的块——把陈述句硬当问题会产出无效的
 * FAQPage。抽不到就返回空数组，调用方据此跳过。
 */
export function extractFaq(page: DocPage): Array<{ question: string; answer: string }> {
  const contents = page.data.structuredData?.contents;
  if (!contents) return [];

  const titles = headingTextMap(page);
  // 同一标题下可能有多段正文，按标题聚合后再判定
  const grouped = new Map<string, string[]>();
  for (const { heading, content } of contents) {
    const id = heading?.trim();
    const text = content.trim();
    if (!id || !text) continue;
    // 映射不到原文的块说明 headings 与 contents 对不上，宁可跳过
    const title = titles.get(id)?.trim();
    if (!title) continue;
    if (!/[?？]\s*$/.test(title) && !QUESTION_PREFIX.test(title) && !QUESTION_INLINE.test(title)) {
      continue;
    }

    const paragraphs = grouped.get(title);
    if (paragraphs) paragraphs.push(text);
    else grouped.set(title, [text]);
  }

  return [...grouped].map(([question, paragraphs]) => ({
    question,
    // Answer 是纯文本字段：段落之间用空格连接，不带换行与 Markdown 语法
    answer: paragraphs.join(' ').replace(/\s+/g, ' ').slice(0, 1000),
  }));
}

/**
 * 从正文抽取 HowTo 步骤：只认「步骤 N：xxx / Step N: xxx」这类编号小节。
 *
 * 步骤标题在 contents 里可能没有正文（正文全挂在它的子标题下），所以先扫
 * 目录，把每个标题归属到最近的步骤标题。编号不是从 1 连续、或有步骤没有
 * 正文时返回空数组，调用方据此跳过，不按段落顺序臆造步骤。
 */
export function extractHowToSteps(page: DocPage): Array<{ name: string; text: string }> {
  const contents = page.data.structuredData?.contents;
  if (!contents) return [];

  const titles = headingTextMap(page);
  const stepOf = new Map<string, number>();
  const stepNames = new Map<number, string>();
  const stack: Array<{ depth: number; step: number | null }> = [];
  for (const item of page.data.toc) {
    const id = item.url.startsWith('#') ? item.url.slice(1) : item.url;
    if (!id) continue;
    // 目录是扁平的，出栈到同级或更浅的标题
    while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) stack.pop();

    const match = titles.get(id)?.trim().match(STEP_HEADING);
    if (match) {
      const step = Number(match[1]);
      stepNames.set(step, match[2].trim());
      stepOf.set(id, step);
      stack.push({ depth: item.depth, step });
      continue;
    }
    // 非步骤标题继承最近的更浅一层步骤
    const step = stack[stack.length - 1]?.step ?? null;
    stack.push({ depth: item.depth, step });
    if (step !== null) stepOf.set(id, step);
  }
  // 目录里连两个步骤标题都没有，说明页面不是编号流程
  if (stepNames.size < 2) return [];

  const grouped = new Map<number, string[]>();
  for (const { heading, content } of contents) {
    const id = heading?.trim();
    const text = content.trim();
    if (!id || !text) continue;
    const step = stepOf.get(id);
    if (step === undefined) continue;

    const paragraphs = grouped.get(step);
    if (paragraphs) paragraphs.push(text);
    else grouped.set(step, [text]);
  }

  // 只保留有正文的步骤：标题下连一段描述都没有，写进 HowTo 也是空壳
  const ordered = [...grouped].sort(([a], [b]) => a - b);
  // 编号必须从 1 开始且连续，中间缺一步说明正文不是完整流程
  if (ordered.some(([index], position) => index !== position + 1)) return [];

  return ordered.map(([index, paragraphs]) => ({
    name: stepNames.get(index) ?? '',
    text: paragraphs.join(' ').replace(/\s+/g, ' ').slice(0, 1000),
  }));
}

/**
 * 文档页的节点清单：TechArticle + BreadcrumbList（+ 正文确有问答时的 FAQPage、
 * 整页为编号流程时的 HowTo）。
 *
 * 面包屑只链接当前正文语言下真实存在的父文档，不为目录名编造落地页。
 */
export function docGraph(page: DocPage, lang: Locale): Array<Record<string, unknown>> {
  const contentLocale = contentLocaleOf(page, lang);
  const canonical = absolute(getDocCanonicalUrl(page, lang));
  const homeUrl = absolute(localePath(contentLocale, '/'));
  const description = page.data.description?.trim() || page.data.title;

  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: HOME_COPY[contentLocale].title, url: homeUrl },
  ];
  for (let depth = 1; depth < page.slugs.length; depth += 1) {
    const parent = source.getPage(page.slugs.slice(0, depth), contentLocale);
    if (!parent || !isTranslatedPage(parent, contentLocale)) continue;
    breadcrumbs.push({
      name: parent.data.title,
      url: absolute(getDocCanonicalUrl(parent, contentLocale)),
    });
  }
  breadcrumbs.push({ name: page.data.title, url: canonical });

  const section = sectionNameOf(page, contentLocale);
  // 日期取自 git 提交记录；拿不到（浅克隆、非 git 部署）就整个字段省略，
  // 不写一个和正文无关的构建时间充当修改日期。页头的「最后更新于」读的同一份数据。
  const dates = getContentDates(page.path);

  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'TechArticle',
      '@id': `${canonical}#article`,
      url: canonical,
      mainEntityOfPage: canonical,
      headline: page.data.title,
      description,
      inLanguage: HTML_LANG[contentLocale],
      image: absolute(getPageImageUrl(getResourcePage(page, lang)).url),
      ...(section ? { articleSection: section } : {}),
      ...(dates ? { datePublished: dates.published, dateModified: dates.modified } : {}),
      // author 内联而不是纯 @id 引用：富结果校验器对 author 的解析更稳。
      // 带同一个 @id，校验器会把它与站点级 Organization 合并成同一实体。
      author: {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: siteConfig.productName,
        url: siteConfig.productUrl,
      },
      publisher: { '@id': ORGANIZATION_ID },
      isPartOf: { '@id': `${homeUrl}#website` },
      breadcrumb: { '@id': `${canonical}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
  ];

  const faq = extractFaq(page);
  // 单个问答不值得单独成节点
  if (faq.length >= 2) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      url: canonical,
      inLanguage: HTML_LANG[contentLocale],
      isPartOf: { '@id': `${homeUrl}#website` },
      mainEntity: faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  const steps = HOWTO_SLUGS.has(page.slugs.join('/')) ? extractHowToSteps(page) : [];
  if (steps.length >= 2) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${canonical}#howto`,
      name: page.data.title,
      description,
      inLanguage: HTML_LANG[contentLocale],
      step: steps.map((item, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: item.name,
        text: item.text,
      })),
    });
  }

  return graph;
}
