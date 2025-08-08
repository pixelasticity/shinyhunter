'use client';

import styles from "../../page.module.css";
import { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { Search } from "../../components/search";
import List from "../../components/list";
import Stats from "../../components/Stats";
import SWRProvider from "../../components/SWRProvider";
import Tabs from '../../components/Tabs';

const pokedexes = [
  { label: 'Paldea', url: '/api/pokemon/pokedex/31/', name: 'paldea' },
  { label: 'Kitakami', url: '/api/pokemon/pokedex/32/', name: 'kitakami' },
  { label: 'Blueberry Academy', url: '/api/pokemon/pokedex/33/', name: 'blueberry-academy' },
];

function PokedexView() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { mutate } = useSWRConfig();

  const handleTabChange = (url: string) => {
    const pokedexName = pokedexes.find((p) => p.url === url)?.name;
    if (pokedexName) {
      const params = new URLSearchParams(searchParams);
      params.delete('query');
      router.push(`/pokedex/${pokedexName}?${params.toString()}`);
      mutate(url);
    }
  };

  const pokedexParam = Array.isArray(params.pokedex) ? params.pokedex[0] : params.pokedex;
  const pokedexName = pokedexParam || 'paldea';
  const pokedexUrl = pokedexes.find((p) => p.name === pokedexName)?.url || pokedexes[0].url;
  const query = searchParams.get('query') || '';

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
          <Suspense>
            <Search placeholder="Search by name or number&hellip;" />
          </Suspense>
          <List query={query} pokemonData={pokemonData} error={error} isLoading={isLoading} />
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
