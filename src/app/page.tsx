'use client';

import styles from "./page.module.css";
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from "./components/search";
import List from "./components/list";
import Stats from "./components/Stats";
import SkipLink from "./components/SkipLink";
import SWRProvider from "./components/SWRProvider";

export default function Home() {
  const [query, setQuery] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Update query when search params change
    const urlQuery = searchParams.get('query') || '';
    setQuery(urlQuery);
  }, [searchParams]);

  return (
    <SWRProvider>
      <SkipLink />
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Shiny Hunt</h1>
        </header>
        <main id="main-content" className={styles.main}>
          <Stats totalPokemon={400} />
          <div className={styles.content}>
            <div style={{ flex: 1 }}>
              <Suspense>
                <Search placeholder="Search by name or number&hellip;" />
              </Suspense>
              <Suspense key={query} fallback={<div>Loading&hellip;</div>}>
                <List query={query} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </SWRProvider>
  )
}
