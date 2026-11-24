'use client';

import { KeyRound, Link2, Sparkles } from 'lucide-react';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { CLIENT_GUIDE_COPY } from '@/lib/client-guide-copy';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';
import { siteConfig } from '@/lib/site';
import { HOME_ENDPOINTS } from '@/lib/home-copy';

interface ClientGuideProps {
  name: string;
  icon: string;
  protocol: 'openai' | 'anthropic';
  baseUrl: string;
}

export function ClientGuide({ name, icon, protocol, baseUrl }: ClientGuideProps) {
  const { locale } = useI18n();
  const lang: Locale = isLocale(locale ?? '') ? (locale as Locale) : DEFAULT_LOCALE;
  const copy = CLIENT_GUIDE_COPY[lang];
  const protocolLabel = protocol === 'openai' ? 'OpenAI' : 'Anthropic';
  const exampleModel = protocol === 'openai' ? 'gpt-5.4' : 'claude-opus-4-7';
  const note = protocol === 'anthropic' ? copy.anthropicNote : copy.openaiNote;
  const noteUrl = protocol === 'anthropic' ? HOME_ENDPOINTS.anthropic : HOME_ENDPOINTS.openai;
  const noteHint = protocol === 'anthropic' ? '/v1/messages' : '/v1';

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-fd-border p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <KeyRound aria-hidden="true" className="size-5" />
          {copy.keyTitle}
        </h2>
        <p className="mt-3 text-sm leading-7 text-fd-muted-foreground">{copy.keyIntro}</p>
        <p className="mt-2 text-sm">
          {copy.consoleLabel}：<a href={siteConfig.links.console} target="_blank" rel="noreferrer">fishxcode.com/console</a>
        </p>
      </section>

      <section className="rounded-xl border border-fd-border p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Link2 aria-hidden="true" className="size-5" />
          {copy.configTitle}
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-fd-border text-fd-muted-foreground">
                <th className="py-2 pr-4 font-medium">{copy.configHeader}</th>
                <th className="py-2 font-medium">{copy.valueHeader}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-fd-border/60">
                <td className="py-3 pr-4">{copy.keyField}</td>
                <td className="py-3">{copy.keyValue}</td>
              </tr>
              <tr className="border-b border-fd-border/60">
                <td className="py-3 pr-4">{copy.baseField}</td>
                <td className="py-3"><code>{baseUrl}</code></td>
              </tr>
              <tr>
                <td className="py-3 pr-4">{copy.modelField}</td>
                <td className="py-3"><code>{exampleModel}</code>{copy.modelValue}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-fd-muted-foreground">
          {note} <code>{noteUrl}</code>；{protocol === 'anthropic' ? '若客户端要求完整地址，再按' : '不要重复追加'} <code>{noteHint}</code>{protocol === 'anthropic' ? ' 等路径补全。' : '。'}
        </p>
      </section>

      <section className="rounded-xl border border-fd-border p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles aria-hidden="true" className="size-5" />
          {copy.verifyTitle}
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-fd-muted-foreground">
          {copy.verifySteps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>
    </div>
  );
}
