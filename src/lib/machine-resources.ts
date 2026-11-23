import type { Metadata } from 'next';
import { localePath, type Locale } from './i18n';
import { siteConfig } from './site';

type AlternateTypes = NonNullable<NonNullable<Metadata['alternates']>['types']>;

/**
 * 页面 <head> 里的机器订阅入口：RSS、llms 索引与全文。
 *
 * Next 不对 `alternates` 做深层合并——页面一旦定义了它，根布局声明的那一份
 * 就整体失效。所以根布局、首页工厂、文档页工厂都从这里取，不各写一套。
 * 调用方按需再补 `text/markdown`（各自的 Markdown 副本地址不同）。
 */
export function machineResourceTypes(lang: Locale): AlternateTypes {
  return {
    'application/rss+xml': [
      { url: localePath(lang, '/rss.xml'), title: `${siteConfig.productName} RSS` },
    ],
    'text/plain': [
      { url: localePath(lang, '/llms.txt'), title: `${siteConfig.productName} llms.txt` },
      {
        url: localePath(lang, '/llms-full.txt'),
        title: `${siteConfig.productName} llms-full.txt`,
      },
    ],
  };
}
