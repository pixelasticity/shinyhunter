'use client';

import styles from "../../page.module.css";
import { Suspense, useEffect } from 'react';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { Search } from "../../components/search";
import List from "../../components/list";
import Stats from "../../components/Stats";
import SWRProvider from "../../components/SWRProvider";
import Tabs from '../../components/Tabs';
import ViewToggle from "../../components/ViewToggle";
import { pokedexes } from '../../lib/constants';
import { CaughtManager } from '../../components/CaughtManager';

function PokedexView() {
  useEffect(() => {
    CaughtManager.initialize();
  }, []);

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { replace } = useRouter(); // Add replace from useRouter
  const { mutate } = useSWRConfig();

  const handleTabChange = (url: string) => {
    const pokedexName = pokedexes.find((p) => p.url === url)?.name;
    if (pokedexName) {
      const params = new URLSearchParams(searchParams);
      params.delete('query');
      replace(`/pokedex/${pokedexName}?${params.toString()}`); // Use replace here
      mutate(url);
    }
  };

  const handleViewChange = (view: 'list' | 'grid') => {
    const params = new URLSearchParams(searchParams);
    if (view === 'list') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const pokedexParam = Array.isArray(params.pokedex) ? params.pokedex[0] : params.pokedex;
  const pokedexName = pokedexParam || 'paldea';
  const pokedexUrl = pokedexes.find((p) => p.name === pokedexName)?.url || pokedexes[0].url;
  const pathname = usePathname(); // Get pathname here
  const query = searchParams.get('query') || '';
  const viewMode = (searchParams.get('view') || 'list') as 'list' | 'grid';

  const { data: pokemonData, error, isLoading } = useSWR(pokedexUrl);
  console.log('PokedexPage SWR data:', { pokemonData, error, isLoading });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Shiny Hunter</h1>
      </header>
      <main id="main-content" className={styles.main}>
        <Tabs tabs={pokedexes} activeTab={pokedexUrl} onTabChange={handleTabChange} />
        <Stats pokemonEntries={pokemonData?.pokemon_entries || []} />
        <div className={styles.content}>
          <div className={styles['search-and-toggle']}>
            <Suspense>
              <Search placeholder="Search by name or number&hellip;" />
            </Suspense>
            <ViewToggle initialView={viewMode} onViewChange={handleViewChange} />
          </div>
          <List query={query} pokemonData={pokemonData} error={error} isLoading={isLoading} viewMode={viewMode} />
        </div>
      </main>
    </div>
  );
}

export default function PokedexPage() {
  return (
    <SWRProvider>
      <PokedexView />
    </SWRProvider>
  );
}
