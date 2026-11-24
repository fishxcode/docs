'use client';

import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';

export default function NotFoundSearchButton({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  const { enabled, setOpenSearch } = useSearchContext();

  return (
    <button
      type="button"
      className={className}
      disabled={!enabled}
      onClick={() => setOpenSearch(true)}
    >
      <Search aria-hidden="true" className="size-4" />
      {label}
    </button>
  );
}
