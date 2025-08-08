'use client';

import { SWRConfig } from 'swr';

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      // Attach extra info to the error object.
      // @ts-ignore
      error.info = await res.json();
      // @ts-ignore
      error.status = res.status;
      throw error;
    }
    return res.json();
  } catch (e) {
    console.error('Fetcher error:', e);
    throw e;
  }
};

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
      }}
    >
      {children}
    </SWRConfig>
  );
}
