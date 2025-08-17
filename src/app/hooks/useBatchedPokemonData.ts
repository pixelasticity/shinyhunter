import { useMemo } from 'react';
import useSWR from 'swr';
import { PokemonEntry, PokemonData, SpeciesData } from '../lib/types';

const batchFetcher = async (urls: string[]): Promise<any[]> => {
  if (urls.length === 0) {
    return [];
  }
  const urlParams = new URLSearchParams({ urls: urls.join(',') });
  const res = await fetch(`/api/pokemon/batch?${urlParams.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch batch data');
  }
  return res.json();
};

export function useBatchedPokemonData(pokemonEntries: PokemonEntry[]) {
  // Generate all URLs we need to fetch
  const { pokemonUrls, speciesUrls } = useMemo(() => {
    const pokemonUrls = pokemonEntries.map(entry =>
      entry.pokemon_species.url.replace('https://pokeapi.co/api/v2', '').replace('pokemon-species', 'pokemon')
    );
    const speciesUrls = pokemonEntries.map(entry => 
      entry.pokemon_species.url.replace('https://pokeapi.co/api/v2', '')
    );
    
    return { pokemonUrls, speciesUrls };
  }, [pokemonEntries]);

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

  // Fetch Pokemon data in batches
  const { data: pokemonBatchData, error: pokemonError, isLoading: pokemonLoading } = useSWR(
    pokemonUrls.length > 0 ? ['pokemon-batch', pokemonUrls] : null,
    ([, urls]) => batchFetcher(urls),
    swrOptions
  );

  // Fetch Species data in batches
  const { data: speciesBatchData, error: speciesError, isLoading: speciesLoading } = useSWR(
    speciesUrls.length > 0 ? ['species-batch', speciesUrls] : null,
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

  return {
    pokemonDataMap,
    speciesDataMap,
    isLoading: pokemonLoading || speciesLoading,
    error: pokemonError || speciesError,
    // Helper functions
    getPokemonData: (name: string) => pokemonDataMap.get(name),
    getSpeciesData: (name: string) => speciesDataMap.get(name),
  };
}
