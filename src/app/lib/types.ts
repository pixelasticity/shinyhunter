export type PokemonEntry = {
  entry_number: number;
  pokemon_species: {
    name: string;
    url: string;
  };
};

export type PokemonData = {
  types: Array<{ type: { name: string; url: string } }>; // Added url here
  id: number;
  name?: string;
  species?: {
    name: string;
    url: string;
  };
};

export type SpeciesData = {
  color: { name: string };
  id: number;
  name?: string;
  names: Name[];
};

export type PokemonState = 'none' | 'caught' | 'shiny';

export interface PokemonSpriteInfo {
  pokemonState: PokemonState;
  isShiny: boolean;
  spritePath: string;
  altText: string;
}

export type Name = {
  language: {
    name: string;
    url: string;
  };
  name: string;
};

export interface PokemonInfo {
  entryNumber: number;
  name: string;
  names: Name[];
  speciesUrl?: string | null;
  nationalId?: number | undefined;
  styles?: { [key: string]: string };
}

export type Types = {
  type: {
    name: string;
    url?: string; // Make url optional here as it might not always be present
  };
};

export type TypeData = {
  id: number;
  name: string;
  names: Name[];
  url?: string; // Add url here as it's used in useBatchedPokemonData
};

export interface StatsProps {
  pokemonEntries: PokemonEntry[];
  pokédex: string;
  className?: string;
}
