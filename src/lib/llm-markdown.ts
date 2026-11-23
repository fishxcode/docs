import type { Root, Nodes } from 'mdast';
import { gfmToMarkdown } from 'mdast-util-gfm';
import {
  mdxToMarkdown,
  type MdxJsxAttribute,
  type MdxJsxFlowElement,
  type MdxJsxTextElement,
} from 'mdast-util-mdx';
import { defaultHandlers, toMarkdown, type Options } from 'mdast-util-to-markdown';

type JsxElement = MdxJsxFlowElement | MdxJsxTextElement;

/** 取 JSX 组件上的字符串属性；表达式形式的属性取不到稳定文本，忽略。 */
function stringAttribute(node: JsxElement, name: string): string | undefined {
  const attribute = node.attributes.find(
    (item): item is MdxJsxAttribute => item.type === 'mdxJsxAttribute' && item.name === name,
  );
  return typeof attribute?.value === 'string' ? attribute.value : undefined;
}

function imageAlt(node: JsxElement): string {
  return stringAttribute(node, 'alt') ?? '';
}

/**
 * MDX 组件的"标题"：Callout / Card / Tab 等组件的标签写在 title 或 value 属性上。
 * 只输出子内容会把它弄丢——读副本的人分不清两个标签页分别是哪种语言——
 * 所以作为加粗小标题保留；带 href 的组件（Card）连同链接一起输出。
 */
function componentHeading(node: JsxElement, resolveLink: (href: string) => string): string {
  const label = stringAttribute(node, 'title') ?? stringAttribute(node, 'value');
  if (!label) return '';

  const href = stringAttribute(node, 'href');
  return href ? `[**${label}**](${resolveLink(href)})` : `**${label}**`;
}

/**
 * 把文档的语法树序列化成对人和 LLM 都易读的 Markdown。
 *
 * 只用 mdast 的标准扩展（GFM、MDX），不依赖 fumadocs 的编译内部字段：
 * - frontmatter、import / export 语句与表达式不进正文；
 * - 图片只保留 alt 文本：副本会被拼进单文件的 llms-full.txt，脱离站点后图片地址没有意义；
 * - `resolveLink` 改写每一个链接的地址（站内相对链接 → 规范绝对 URL），代码块除外。
 */
export function readableMarkdown(tree: Root, resolveLink: (href: string) => string): string {
  const options: Options = {
    extensions: [gfmToMarkdown(), mdxToMarkdown()],
    handlers: {
      yaml: () => '',
      mdxjsEsm: () => '',
      mdxFlowExpression: () => '',
      mdxTextExpression: () => '',
      mdxJsxFlowElement(node, _parent, state, info) {
        // 独占一行的 <img>：没有子内容，只输出 alt
        if (node.name === 'img') {
          return defaultHandlers.text({ type: 'text', value: imageAlt(node) }, undefined, state, info);
        }
        const heading = componentHeading(node, resolveLink);
        const body = state.containerFlow(node, info);
        return heading ? `${heading}\n\n${body}` : body;
      },
      mdxJsxTextElement(node, _parent, state, info) {
        if (node.name !== 'img') return state.containerPhrasing(node, info);
        return defaultHandlers.text({ type: 'text', value: imageAlt(node) }, undefined, state, info);
      },
      image: (node, _parent, state, info) =>
        defaultHandlers.text({ type: 'text', value: node.alt ?? '' }, undefined, state, info),
      imageReference: (node, _parent, state, info) =>
        defaultHandlers.text({ type: 'text', value: node.alt ?? '' }, undefined, state, info),
    },
  };

  // 在副本上改写，不污染 loader 缓存里的语法树
  const copy = structuredClone(tree);
  function visit(node: Nodes): void {
    if (node.type === 'code' || node.type === 'inlineCode') return;
    if (node.type === 'link' || node.type === 'definition') node.url = resolveLink(node.url);
    if ('children' in node) node.children.forEach(visit);
  }
  visit(copy);

  return toMarkdown(copy, options).trim();
}
