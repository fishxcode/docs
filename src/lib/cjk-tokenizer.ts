/**
 * 中英混合分词器。
 *
 * Fumadocs 16.19 使用 ZBSearch。这里的做法是 bigram（二元切分）：中文没有
 * 词边界，把「安卓手机」切成单字 + 相邻二元组（安/卓/手/机/安卓/卓手/手机），
 * 查询侧同样切分后即可命中。
 *
 * SSR 模式下分词只在服务端（建索引与查询共用同一个 db 组件里的分词器），
 * 客户端只发原始查询串；但服务端建索引与查询必须共用这一个实现，
 * 否则切分不一致会搜不出结果。
 */
const CJK = /[㐀-䶿一-鿿豈-﫿]/;
const CJK_RUN = /[㐀-䶿一-鿿豈-﫿]+/g;
const NON_CJK_RUN = /[^㐀-䶿一-鿿豈-﫿]+/g;
const LATIN_SPLIT = /[^a-z0-9_'-]+/g;

export function createCjkTokenizer() {
  function tokenize(input: string | unknown): string[] {
    if (typeof input !== 'string') return [String(input)];

    const lower = input.toLowerCase();
    const segments = lower.match(new RegExp(`${CJK_RUN.source}|${NON_CJK_RUN.source}`, 'g')) ?? [];
    const tokens: string[] = [];

    for (const segment of segments) {
      if (CJK.test(segment)) {
        // 单字保证召回，二元组保证相邻字组合（如「手机」）也能命中
        for (let i = 0; i < segment.length; i += 1) {
          tokens.push(segment[i]);
          if (i + 1 < segment.length) tokens.push(segment.slice(i, i + 2));
        }
      } else {
        for (const token of segment.split(LATIN_SPLIT)) {
          if (token) tokens.push(token);
        }
      }
    }

    return [...new Set(tokens)];
  }

  const tokenizer = {
    tokenize,
    language: 'english',
    stemmer: undefined,
    stemmerSkipProperties: new Set<string>(),
    tokenizeSkipProperties: new Set<string>(),
    stopWords: [] as string[],
    allowDuplicates: false,
    normalizeToken: (token: string) => token,
    normalizationCache: new Map<string, string>(),
  };

  tokenizer.tokenize = tokenize.bind(tokenizer);
  return tokenizer;
}
