'use client';

import { useMemo } from 'react';
import styles from './list.module.css';
import { useBatchedPokemonData } from '../hooks/useBatchedPokemonData';
import { capitalizeFirst } from '../lib/utils';
import ListSkeleton from './skeletons';
import { PokemonEntry } from '../lib/types';
import PokemonRow from './PokemonRow';

function fetchFilteredData(
  data: Record<string, PokemonEntry>,
  query: string,
  getPokemonData: (name: string) => any
): PokemonEntry[] {
  const values = Object.values(data);

  const raw = query.toLowerCase().trim();
  const nameQuery = raw.replace(/^0+/, "") || "0"; // for numeric lookups
  const numberQuery = /^\d+$/.test(raw) ? parseInt(raw, 10) : null;

  return values.filter(({ entry_number, pokemon_species }) => {
    const name = pokemon_species.name.toLowerCase();
    const pokemonData = getPokemonData(pokemon_species.name);
    const nationalId = pokemonData?.id;

    // 1) Exact match on entry number (if numeric)
    if (numberQuery !== null && entry_number === numberQuery) {
      return true;
    }

    // 2) Exact match on national ID (if numeric)
    if (numberQuery !== null && nationalId === numberQuery) {
      return true;
    }

    // 3) Partial match on name
    if (name.includes(raw)) {
      return true;
    }

    // 4) Leading-zero normalized number as string
    if (entry_number.toString() === nameQuery) {
      return true;
    }

    return false;
  });
}

export default function List({
  query,
  pokemonData,
  error,
  isLoading,
}: {
  query: string;
  pokemonData: any;
  error: any;
  isLoading: boolean;
}) {
  // Get Pokemon entries for batched data fetching
  const pokemonEntries = pokemonData?.pokemon_entries || [];
  
  // Use batched data hook
  const {
    getPokemonData,
    getSpeciesData,
    isLoading: batchLoading,
    error: batchError
  } = useBatchedPokemonData(pokemonEntries);

  // Filter Pokemon based on query
  const pokémon = pokemonData?.pokemon_entries || {};
  const filteredPokémon = useMemo(() => fetchFilteredData(pokémon, query, getPokemonData), [pokémon, query, getPokemonData]);

  if (isLoading) {
    return (
      <div className={styles['cont']}>
        <table className={styles['table']} role="table">
          <thead>
            <tr>
              <th scope="colgroup" colSpan={5}><h3 className={styles.heading}>Loading&hellip;</h3></th>
            </tr>
          </thead>
        </table>
        <ListSkeleton />
      </div>
    );
  }

  if (error) {
    return <div role="alert" aria-live="assertive">Error loading data: {error.message}</div>;
  }

  if (batchError) {
    return <div role="alert" aria-live="assertive">Error loading Pokemon data: {batchError.message}</div>;
  }

  if (!pokemonData) {
    return <div role="status">No Pokédex data available</div>;
  }

  const name = pokemonData.name;

  return (
    <div className={styles['cont']}>
      <table className={styles['table']} role="table" aria-label={`${capitalizeFirst(name)} Pokédex`}>
        <thead>
          <tr>
            <th scope="colgroup" colSpan={5}><h3 className={styles.heading}>{capitalizeFirst(name)}</h3></th>
          </tr>
        </thead>
      </table>
      <div className="view" role="list">
        {filteredPokémon.map((entry) => (
          <PokemonRow
            key={entry.entry_number}
            entry={entry}
            getPokemonData={getPokemonData}
            getSpeciesData={getSpeciesData}
            batchLoading={batchLoading}
          />
        ))}
      </div>
    </div>
  )
}
