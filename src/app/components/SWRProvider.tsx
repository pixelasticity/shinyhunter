'use client';

import { SWRConfig } from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SWRProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 60000,
        refreshInterval: 300000,
      }}
    >
      {children}
    </SWRConfig>
  );
} 