'use client';

import styles from "./page.module.css";
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from "./components/search";
import List from "./components/list";
import Stats from "./components/Stats";
import SkipLink from "./components/SkipLink";
import SWRProvider from "./components/SWRProvider";
import QueryProvider from "./components/QueryProvider";

export default function Home() {
  return (
    <SWRProvider>
      <SkipLink />
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Shiny Hunter</h1>
        </header>
        <main id="main-content" className={styles.main}>
          <Stats totalPokemon={400} />
          <div className={styles.content}>
            <div style={{ flex: 1 }}>
              <Suspense>
                <Search placeholder="Search by name or number&hellip;" />
              </Suspense>
              <Suspense fallback={<div>Loading&hellip;</div>}>
                <QueryProvider>
                  {(query) => <List query={query} />}
                </QueryProvider>
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </SWRProvider>
  )
}
