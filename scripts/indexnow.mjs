// 把构建产物 sitemap 里的 URL 提交给 IndexNow（Bing / Yandex / Naver / Seznam 等）。
//
// 用法：
//   npm run build            # 先生成 out/sitemap.xml
//   npm run indexnow         # 默认 dry-run，只打印将要提交的 URL
//   npm run indexnow -- --submit   # 真正提交
//
// key 约定：public/ 下放一个 32 位十六进制的 <key>.txt，内容与文件名一致。
// 这是 IndexNow 的所有权校验文件，必须能通过 https://<host>/<key>.txt 公开访问。
// 提交只影响支持 IndexNow 的搜索引擎；OpenAI 未公开说明它与 ChatGPT 引用的关系，
// 因此不要把它当成 ChatGPT 收录的开关。
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = join(ROOT, 'public');
const SITEMAP_PATH = join(ROOT, 'out', 'sitemap.xml');
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.fishxcode.com').replace(/\/+$/, '');
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_BATCH = 10_000;
const submit = process.argv.includes('--submit');

/** 找到 public/ 下唯一的 IndexNow key 文件并校验内容。 */
async function findKey() {
  const files = await readdir(PUBLIC_DIR);
  const candidates = files.filter((name) => /^[0-9a-f]{32}\.txt$/i.test(name));
  if (candidates.length === 0) {
    throw new Error('public/ 下没有 IndexNow key 文件（应为 32 位十六进制的 <key>.txt）');
  }
  if (candidates.length > 1) {
    throw new Error(`public/ 下有多个候选 key 文件，请只保留一个：${candidates.join(', ')}`);
  }
  const file = candidates[0];
  const key = file.replace(/\.txt$/i, '');
  const body = (await readFile(join(PUBLIC_DIR, file), 'utf8')).trim();
  if (body !== key) {
    throw new Error(`key 文件内容与文件名不一致：${file}`);
  }
  return { key, keyLocation: `${SITE_URL}/${file}` };
}

/** 从静态导出的 sitemap 提取本站 URL，去重并保持顺序。 */
async function readSitemapUrls() {
  let xml;
  try {
    xml = await readFile(SITEMAP_PATH, 'utf8');
  } catch {
    throw new Error('缺少 out/sitemap.xml，请先运行 npm run build');
  }
  const seen = new Set();
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = match[1].replace(/&amp;/g, '&').trim();
    // 只提交本站 URL，避免把 sitemap 里可能出现的别名域名一起推出去
    if (url === SITE_URL || url.startsWith(`${SITE_URL}/`)) seen.add(url);
  }
  return [...seen];
}

/**
 * 提交前确认 key 文件真的能从公网取到。
 * IndexNow 校验失败只会回一个 403，不告诉你是「没部署」还是「路径被改写」，所以先自己查一遍。
 */
async function verifyKeyLocation(key, keyLocation) {
  let response;
  try {
    response = await fetch(keyLocation, {
      redirect: 'follow',
      headers: { 'User-Agent': 'fishxcode-docs-indexnow/1.0 (+https://docs.fishxcode.com)', Accept: 'text/plain' },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new Error(
      `无法访问 key 校验地址 ${keyLocation}\n  ${error.message}\n` +
        '  若本机网络与代理正常，通常是该文件还没部署，先执行 npm run deploy:cf',
    );
  }
  if (!response.ok) {
    throw new Error(
      `key 校验地址返回 HTTP ${response.status}：${keyLocation}\n` +
        '  说明该文件还没上线（或路径被改写）。先部署，再确认这个地址能直接看到 32 位 key。',
    );
  }
  const body = (await response.text()).trim();
  if (body !== key) {
    throw new Error(
      `key 校验地址的内容与文件名不一致\n  期望：${key}\n  实际：${body.slice(0, 80)}\n` +
        '  通常是 CDN/Worker 把该路径改写成了 HTML，或 public/ 下的文件没被复制进 out/。',
    );
  }
}

/** IndexNow 状态码含义，避免只看到一个数字。 */
const STATUS_HINT = {
  400: '请求格式有误',
  403: 'key 校验失败，IndexNow 取不到 keyLocation 或内容不一致',
  422: 'URL 不属于该 host，或 key 与 keyLocation 不匹配',
  429: '提交过于频繁，稍后重试',
};

function chunk(items, size) {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

const { key, keyLocation } = await findKey();
const urls = await readSitemapUrls();
if (urls.length === 0) {
  console.log('sitemap 中没有找到本站 URL，已退出。');
  process.exit(0);
}

console.log(`IndexNow key: ${key}`);
console.log(`key 校验地址: ${keyLocation}`);
console.log(`待提交 URL: ${urls.length} 条`);
for (const url of urls.slice(0, 5)) console.log(`  - ${url}`);
if (urls.length > 5) console.log(`  … 其余 ${urls.length - 5} 条`);

if (!submit) {
  console.log('\n当前为 dry-run，未发送任何请求。确认无误后执行：npm run indexnow -- --submit');
  process.exit(0);
}

await verifyKeyLocation(key, keyLocation);
console.log('key 校验通过，开始提交…\n');

const host = new URL(SITE_URL).host;
let failed = 0;
for (const [index, urlList] of chunk(urls, MAX_BATCH).entries()) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // 不带 UA 时 undici 默认用 "node"，部分边缘节点会直接拦掉
      'User-Agent': 'fishxcode-docs-indexnow/1.0 (+https://docs.fishxcode.com)',
    },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });
  // IndexNow 用 200/202 表示已接受；它只保证"收到了通知"，不保证立即收录。
  const ok = response.status === 200 || response.status === 202;
  if (!ok) {
    failed += 1;
    // 403 可能来自 IndexNow 业务校验，也可能来自它前面那层 Cloudflare。
    // 只看状态码分不清，必须把响应体和 cf-mitigated 头打出来。
    const body = (await response.text().catch(() => '')).replace(/\s+/g, ' ').trim();
    const mitigated = response.headers.get('cf-mitigated');
    console.log(`批次 ${index + 1}: HTTP ${response.status} 失败（${urlList.length} 条）`);
    console.log(`  含义：${STATUS_HINT[response.status] ?? '未知错误'}`);
    if (mitigated) console.log(`  cf-mitigated: ${mitigated} → 是被 Cloudflare 拦截/挑战，不是 IndexNow 业务错误`);
    if (body) console.log(`  响应体：${body.slice(0, 600)}`);
  } else {
    console.log(`批次 ${index + 1}: HTTP ${response.status} 已接受（${urlList.length} 条）`);
  }
}

process.exit(failed === 0 ? 0 : 1);
