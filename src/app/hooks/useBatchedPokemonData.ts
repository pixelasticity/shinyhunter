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
  const { data: pokemonBatchData, error: pokemonError, isLoading: pokemonLoading } = useSWR(
    initialPokemonUrls.length > 0 ? ['pokemon-batch', initialPokemonUrls] : null,
    ([, urls]) => batchFetcher(urls),
    swrOptions
  );

  // Fetch Species data in batches
  const { data: speciesBatchData, error: speciesError, isLoading: speciesLoading } = useSWR(
    initialSpeciesUrls.length > 0 ? ['species-batch', initialSpeciesUrls] : null,
    ([, urls]) => batchFetcher(urls),
    swrOptions
  );

  // Collect unique type URLs from fetched pokemon data
  const typeUrls = useMemo(() => {
    const uniqueTypeUrls = new Set<string>();
    const urls: string[] = [];
    if (pokemonBatchData) {
      pokemonBatchData.forEach((data: PokemonData) => {
        data.types.forEach(typeInfo => {
          // Ensure typeInfo.type.url is accessed safely
          if (typeInfo.type && typeInfo.type.url && !uniqueTypeUrls.has(typeInfo.type.url)) {
            uniqueTypeUrls.add(typeInfo.type.url);
            urls.push(typeInfo.type.url.replace('https://pokeapi.co/api/v2', ''));
          }
        });
      });
    }
    return urls;
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
    typeBatchData.forEach((data: TypeData) => {
      if (data) {
        map.set(data.name, data);
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
