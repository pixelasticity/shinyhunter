export type PokemonEntry = {
  entry_number: number;
  pokemon_species: {
    name: string;
    url: string;
  };
};

export type PokemonData = {
  types: Array<{ type: { name: string } }>;
  id: number;
};

export type SpeciesData = {
  color: { name: string };
  id: number;
};

export type PokemonState = 'none' | 'caught' | 'shiny';

export interface PokemonSpriteInfo {
  pokemonState: PokemonState;
  isShiny: boolean;
  spritePath: string;
  altText: string;
}

export interface PokemonInfo {
  entryNumber: number;
  name: string;
  speciesUrl?: string | null;
  nationalId?: number | undefined;
  styles?: { [key: string]: string };
}

export type Types = {
  type: {
    name: string;
  };
};

export interface StatsProps {
  pokemonEntries: PokemonEntry[];
  className?: string;
}
