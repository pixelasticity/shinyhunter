'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function QueryProvider({ children }: { children: (query: string) => React.ReactNode }) {
  const [query, setQuery] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    setQuery(searchParams.get('query') || '');
  }, [searchParams]);

  return <>{children(query)}</>;
}