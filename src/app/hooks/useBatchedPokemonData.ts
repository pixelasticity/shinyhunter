import { useMemo } from 'react';
import useSWR from 'swr';

type PokemonEntry = {
  entry_number: number;
  pokemon_species: {
    name: string;
    url: string;
  };
};

type PokemonData = {
  types: Array<{ type: { name: string } }>;
  id: number;
};

type SpeciesData = {
  color: { name: string };
  id: number;
};

// Batch fetcher that takes multiple URLs and fetches them in parallel
const batchFetcher = async (urls: string[]): Promise<any[]> => {
  const responses = await Promise.allSettled(
    urls.map(url => fetch(url).then(res => res.json()))
  );
  
  return responses.map(response => 
    response.status === 'fulfilled' ? response.value : null
  );
};

// Create batches of URLs to avoid hitting rate limits
const createBatches = <T>(array: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
};

export function useBatchedPokemonData(pokemonEntries: PokemonEntry[]) {
  // Generate all URLs we need to fetch
  const { pokemonUrls, speciesUrls } = useMemo(() => {
    const pokemonUrls = pokemonEntries.map(entry => 
      entry.pokemon_species.url.replace('pokemon-species', 'pokemon')
    );
    const speciesUrls = pokemonEntries.map(entry => entry.pokemon_species.url);
    
    return { pokemonUrls, speciesUrls };
  }, [pokemonEntries]);

  // Fetch Pokemon data in batches
  const { data: pokemonBatchData, error: pokemonError, isLoading: pokemonLoading } = useSWR(
    pokemonUrls.length > 0 ? ['pokemon-batch', pokemonUrls] : null,
    async ([, urls]) => {
      const batches = createBatches(urls, 20); // 20 requests per batch
      const results: (PokemonData | null)[] = [];
      
      for (const batch of batches) {
        const batchResults = await batchFetcher(batch);
        results.push(...batchResults);
        
        // Small delay between batches to be respectful to the API
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return results;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  // Fetch Species data in batches
  const { data: speciesBatchData, error: speciesError, isLoading: speciesLoading } = useSWR(
    speciesUrls.length > 0 ? ['species-batch', speciesUrls] : null,
    async ([, urls]) => {
      const batches = createBatches(urls, 20);
      const results: (SpeciesData | null)[] = [];
      
      for (const batch of batches) {
        const batchResults = await batchFetcher(batch);
        results.push(...batchResults);
        
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return results;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
    }
  );

  // Create lookup maps for easy access
  const pokemonDataMap = useMemo(() => {
    if (!pokemonBatchData) return new Map();
    
    const map = new Map<number, PokemonData>();
    pokemonEntries.forEach((entry, index) => {
      const data = pokemonBatchData[index];
      if (data) {
        map.set(entry.entry_number, data);
      }
    });
    return map;
  }, [pokemonBatchData, pokemonEntries]);

  const speciesDataMap = useMemo(() => {
    if (!speciesBatchData) return new Map();
    
    const map = new Map<number, SpeciesData>();
    pokemonEntries.forEach((entry, index) => {
      const data = speciesBatchData[index];
      if (data) {
        map.set(entry.entry_number, data);
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
    getPokemonData: (entryNumber: number) => pokemonDataMap.get(entryNumber),
    getSpeciesData: (entryNumber: number) => speciesDataMap.get(entryNumber),
  };
}
