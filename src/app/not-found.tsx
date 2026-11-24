'use client';

import { Activity, ArrowLeft } from 'lucide-react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { usePathname } from 'fumadocs-core/framework';
import Link from '@/components/app-link';
import { AppI18nProvider } from '@/components/app-i18n-provider';
import NotFoundSearchButton from '@/components/not-found-search-button';
import { SiteFooter } from '@/components/site-footer';
import { DEFAULT_LOCALE, stripLocalePrefix } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import { NOT_FOUND_COPY } from '@/lib/not-found-copy';
import { siteConfig } from '@/lib/site';

const actionClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-primary disabled:cursor-not-allowed disabled:opacity-50';

const primaryClass = `${actionClass} border-fd-primary bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90`;

const secondaryClass = `${actionClass} border-fd-border bg-fd-background text-fd-foreground hover:bg-fd-accent`;

export default function NotFound() {
  const { lang } = stripLocalePrefix(usePathname() ?? '/');
  const activeLang = lang ?? DEFAULT_LOCALE;
  const copy = NOT_FOUND_COPY[activeLang];

  return (
    <AppI18nProvider lang={activeLang}>
      <HomeLayout {...baseOptions(activeLang)}>
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <section className="flex w-full max-w-2xl flex-col items-center gap-5 rounded-2xl border border-fd-border bg-fd-card/50 px-6 py-12 text-center shadow-sm">
            <p className="rounded-full border border-fd-border bg-fd-background px-3 py-1 text-xs font-medium text-fd-muted-foreground">
              {copy.eyebrow}
            </p>

            <h1 className="text-7xl font-bold tracking-tight text-fd-muted-foreground">404</h1>

            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-fd-foreground">{copy.title}</h2>
              <p className="text-pretty text-sm leading-7 text-fd-muted-foreground sm:text-base">
                {copy.description}
              </p>
            </div>

            <div className="mt-2 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link href={activeLang === DEFAULT_LOCALE ? '/' : `/${activeLang}`} className={primaryClass}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                {copy.backHome}
              </Link>

              <NotFoundSearchButton className={secondaryClass} label={copy.searchDocs} />

              <Link href={siteConfig.links.status} className={secondaryClass}>
                <Activity aria-hidden="true" className="size-4" />
                {copy.viewStatus}
              </Link>
            </div>
          </section>
        </div>
      </HomeLayout>

      <SiteFooter lang={activeLang} />
    </AppI18nProvider>
  );
}
