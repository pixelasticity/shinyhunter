import { useMemo, useEffect, useState } from 'react';
import useSWR from 'swr';
import { PokemonEntry, PokemonData, SpeciesData, TypeData } from '../lib/types';

const batchFetcher = async <T>(urls: string[]): Promise<T[]> => {
  if (urls.length === 0) {
    return [];
  }
  const urlParams = new URLSearchParams({ urls: urls.join(',') });
  const res = await fetch(`/api/pokemon/batch?${urlParams.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch batch data');
  }
  return res.json() as Promise<T[]>;
};

export function useBatchedPokemonData(pokemonEntries: PokemonEntry[]) {
  const swrOptions = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    onErrorRetry: (error: any, key: any, config: any, revalidate: any, { retryCount }: { retryCount: number }) => {
      // Never retry on 404.
      if (error.status === 404) return;

      // Only retry up to 3 times.
      if (retryCount >= 3) return;

      // Retry with exponential backoff.
      const timeout = Math.pow(2, retryCount) * 1000;
      setTimeout(() => revalidate({ retryCount }), timeout);
    },
  };

  // Generate initial Pokemon and Species URLs
  const initialPokemonUrls = useMemo(() => pokemonEntries.map(entry =>
    entry.pokemon_species.url.replace('https://pokeapi.co/api/v2', '').replace('pokemon-species', 'pokemon')
  ), [pokemonEntries]);

  const initialSpeciesUrls = useMemo(() => pokemonEntries.map(entry =>
    entry.pokemon_species.url.replace('https://pokeapi.co/api/v2', '')
  ), [pokemonEntries]);

  // Fetch Pokemon data in batches
  const { data: pokemonBatchData, error: pokemonError, isLoading: pokemonLoading } = useSWR<PokemonData[], Error>(
    initialPokemonUrls.length > 0 ? ['pokemon-batch', initialPokemonUrls] as const : null,
    ([, urls]) => batchFetcher<PokemonData>(urls as string[]),
    swrOptions
  );

  // Fetch Species data in batches
  const { data: speciesBatchData, error: speciesError, isLoading: speciesLoading } = useSWR<SpeciesData[], Error>(
    initialSpeciesUrls.length > 0 ? ['species-batch', initialSpeciesUrls] as const : null,
    ([, urls]) => batchFetcher<SpeciesData>(urls as string[]),
    swrOptions
  );

  // Collect unique type URLs from fetched pokemon data
  const typeUrls = useMemo(() => {
    if (!pokemonBatchData) return [];

    const urls = pokemonBatchData
      .filter((data): data is PokemonData => !!data && !!data.types)
      .flatMap(data =>
        data.types
          .filter(t => t.type && t.type.url)
          .map(t => t.type.url.replace('https://pokeapi.co/api/v2', ''))
      );

    return Array.from(new Set(urls)); // remove duplicates
  }, [pokemonBatchData]);

  // Fetch Type data in batches
  const { data: typeBatchData, error: typeError, isLoading: typeLoading } = useSWR(
    typeUrls.length > 0 ? ['type-batch', typeUrls] : null,
    ([, urls]) => batchFetcher(urls),
    swrOptions
  );

  // Create lookup maps for easy access
  const pokemonDataMap = useMemo(() => {
    if (!pokemonBatchData) return new Map();
    
    const map = new Map<string, PokemonData>();
    pokemonEntries.forEach((entry, index) => {
      const data = pokemonBatchData[index];
      if (data) {
        map.set(entry.pokemon_species.name, data);
      }
    });
    return map;
  }, [pokemonBatchData, pokemonEntries]);

  const speciesDataMap = useMemo(() => {
    if (!speciesBatchData) return new Map();
    
    const map = new Map<string, SpeciesData>();
    pokemonEntries.forEach((entry, index) => {
      const data = speciesBatchData[index];
      if (data) {
        map.set(entry.pokemon_species.name, data);
      }
    });
    return map;
  }, [speciesBatchData, pokemonEntries]);

  const typeDataMap = useMemo(() => {
    if (!typeBatchData) return new Map<string, TypeData>();

    const map = new Map<string, TypeData>();
    (typeBatchData as TypeData[]).forEach((data) => {
      if (data) {
        map.set(data.name.toLowerCase(), data);
      }
    });
    return map;
  }, [typeBatchData]);

  return {
    pokemonDataMap,
    speciesDataMap,
    typeDataMap,
    isLoading: pokemonLoading || speciesLoading || typeLoading,
    error: pokemonError || speciesError || typeError,
    getPokemonData: (name: string) => pokemonDataMap.get(name),
    getSpeciesData: (name: string) => speciesDataMap.get(name),
    getTypeData: (name: string) => typeDataMap.get(name),
  };
}
