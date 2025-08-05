'use client';

import Image from 'next/image';
import useSWR from 'swr';
import styles from './list.module.css';
import Checkbox from './Checkbox';
import { usePokemonState } from '../hooks/usePokemonState';
import { useBatchedPokemonData } from '../hooks/useBatchedPokemonData';
import { capitalizeFirst } from '../lib/utils';

type Pokémon = {
  entry_number: number,
  pokemon_species: {
    name: string,
    url: string
  }
}

type Types = {
  type: {
    name: string
  }
}

function fetchFilteredData(
  data: Record<string, Pokémon>,
  query: string
): Pokémon[] {
  const values = Object.values(data);

  const raw = query.toLowerCase().trim();
  const nameQuery = raw.replace(/^0+/, '') || '0';     // for numeric lookups
  const numberQuery = /^\d+$/.test(raw) ? parseInt(raw, 10) : null;

  return values.filter(({ entry_number, pokemon_species }) => {
    const name = pokemon_species.name.toLowerCase();

    // 1) Exact match on entry number (if numeric)
    if (numberQuery !== null && entry_number === numberQuery) {
      return true;
    }

    // 2) Partial match on name
    if (name.includes(raw)) {
      return true;
    }

    // 3) Leading-zero normalized number as string
    if (entry_number.toString() === nameQuery) {
      return true;
    }

    return false;
  });
}

// Component to display individual Pokemon data with batched data
function PokemonRow({ 
  entry, 
  pokemonData, 
  speciesData, 
  isLoading 
}: { 
  entry: Pokémon;
  pokemonData?: any;
  speciesData?: any;
  isLoading: boolean;
}) {
  // Use the custom hook for Pokemon state management
  const {
    spriteInfo,
    versionClass,
    formattedEntryNumber
  } = usePokemonState({
    entryNumber: entry.entry_number,
    name: entry.pokemon_species.name,
    speciesUrl: entry.pokemon_species.url,
    styles
  });

  // Get color from the Pokémon data
  const color = speciesData?.color?.name || null;

  if (isLoading) {
    return (
      <div key={entry.entry_number} className={`${styles['pokemon']} ${styles[color]}`}>
        <div className={styles.checkbox} >
          <Checkbox id={entry.entry_number} name={entry.pokemon_species.name} speciesUrl={entry.pokemon_species.url} />
        </div>
        <div className={styles.sprite}>
          <div style={{ width: 64, height: 64, backgroundColor: '#f0f0f0' }}></div>
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{capitalizeFirst(entry.pokemon_species.name)}</h3>
          <span className={styles.number}>
            <span className={styles.hash}><span className="visually-hidden">Number</span><span role='presentation'>#</span></span>{formattedEntryNumber}
          </span>
        </div>
        <span className={styles.types} aria-label="The types are loading">
          <span 
            className={styles['type']}
            role="term"
          >
            Loading&hellip;
          </span>
        </span>
        {versionClass && <div className={styles['tag-wrap']}>
          <div className={`${styles.tag} ${versionClass}`}></div>
        </div>}
      </div>
    );
  }

  // Get types from the Pokemon data
  const types = pokemonData?.types?.map((type: Types) => type.type.name) || [];

  // Handle missing data gracefully
  if (!pokemonData) {
    return (
      <div key={entry.entry_number} className={`${styles['pokemon']} ${styles[color]}`}>
        <div className={styles.checkbox} >
          <Checkbox id={entry.entry_number} name={entry.pokemon_species.name} speciesUrl={entry.pokemon_species.url} />
        </div>
        <div className={styles.sprite}>
          <Image src={spriteInfo.spritePath} alt={spriteInfo.altText} height={64} width={64} />
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{capitalizeFirst(entry.pokemon_species.name)}</h3>
          <span className={styles.number}>
            <span className={styles.hash}><span className="visually-hidden">Number</span><span role='presentation'>#</span></span>{formattedEntryNumber}
          </span>
        </div>
        <span className={styles.types} aria-label="Types unavailable">
          <span 
            className={styles['type']}
            role="term"
            aria-label="Missing type"
          >
            Unknown
          </span>
        </span>
        {versionClass && <div className={styles['tag-wrap']}>
          <div className={`${styles.tag} ${versionClass}`}></div>
        </div>}
      </div>
    );
  }

  return (
    <div key={entry.entry_number} className={`${styles['pokemon']} ${styles[color]}`}>
      <div className={styles.checkbox} >
        <Checkbox id={entry.entry_number} name={entry.pokemon_species.name} speciesUrl={entry.pokemon_species.url} />
      </div>
      <div className={styles.sprite}>
        <Image src={spriteInfo.spritePath} alt={spriteInfo.altText} height={64} width={64} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{capitalizeFirst(entry.pokemon_species.name)}</h3>
        <span className={styles.number}>
          <span className={styles.hash}><span className="visually-hidden">Number</span><span role='presentation'>#</span></span>{formattedEntryNumber}
        </span>
      </div>
      <span className={styles.types} aria-label={`Types: ${types.map((type: string) => capitalizeFirst(type)).join(', ')}`}>
      {types.map((type: string) => (
        <span 
          key={type} 
          className={`${styles['type']} ${styles[type]}`}
          role="term"
          aria-label={`${capitalizeFirst(type)} type`}
        >
          {capitalizeFirst(type)}
        </span>
      ))}
      </span>
      {versionClass && <div className={styles['tag-wrap']}>
        <div className={`${styles.tag} ${versionClass}`}></div>
      </div>}
    </div>
  );
}

export default function List({
  query
}: {
  query: string;
}) {
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Use SWR for data fetching with caching
  const { data: pokemonData, error, isLoading } = useSWR('https://pokeapi.co/api/v2/pokedex/31/');

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
  const filteredPokémon = fetchFilteredData(pokémon, query);

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
      <div className="view" role="list">
        <div className={`${styles.pokemon} ${styles.gray}`} role="status" aria-live="polite">
          <div className={styles.checkbox}>
            <button type="button" className="Checkbox_checkbox__lq5py Checkbox_none__aIVHA"></button>
            <Checkbox id={0} name="" speciesUrl="" />
          </div>
          <div className={styles.sprite}>
            <Image alt="" width="64" height="64" src="/placeholder.png" />
          </div>
          <div className={styles.info}>
            <span style={{height: 'calc(5.7971vw * 1.333)', marginBottom: '2px', width: '100%'}}>
              <span style={{height: '5.7971vw', display: 'inline-block', width: '80%', backgroundColor: '#a4a4a4'}}></span>
            </span>
          </div>
          <span className={styles.types} aria-label="Types loading">
            <span role="term" className={`${styles.type} ${styles.normal}`}>
              <span style={{display: 'inline-block', height: '0.875em', width: '35px',backgroundColor: '#a4a4a4'}}></span>
            </span>
          </span>
        </div>
        </div>
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
      {filteredPokémon.map((entry: Pokémon) => (
        <PokemonRow key={entry.entry_number} entry={entry} />
      ))}
      </div>
    </div>
  )
}