'use client';

import Image from 'next/image';
import useSWR from 'swr';
import styles from './list.module.css';
import Checkbox from './Checkbox';
import { usePokemonState } from '../hooks/usePokemonState';

function fetchFilteredData(data: any, query: string) {
  const filteredEntries: any[] = []
  const searchQuery = query.toLowerCase().trim()
  
  // Normalize the search query - remove leading zeros for number searches
  const normalizedQuery = searchQuery.replace(/^0+/, '') || '0'
  
  Object.entries(data).forEach(function (entry: [string, any], index: number, arr: [string, any][]) {
    const name = entry[1].pokemon_species.name.toLowerCase()
    const entryNumber = entry[1].entry_number.toString()
    
    // Search by name OR entry number (with normalized number matching)
    if (name.includes(searchQuery) || entryNumber === normalizedQuery) {
      filteredEntries.push(entry[1])
    }
  })
  return filteredEntries;
}

// Component to fetch and display individual Pokemon data
function PokemonRow({ entry }: { entry: any }) {
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

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

  // Convert species URL to Pokemon URL to get types
  // Species URL: https://pokeapi.co/api/v2/pokemon-species/1/
  // Pokemon URL: https://pokeapi.co/api/v2/pokemon/1/
  const pokemonUrl = entry.pokemon_species.url.replace('pokemon-species', 'pokemon');

  // Fetch individual Pokemon data using the Pokemon URL
  const { data: pokemonData, error, isLoading } = useSWR(
    pokemonUrl,
    (url: string) => fetch(url).then(res => res.json())
  );

  const { data: speciesData } = useSWR(
    entry.pokemon_species.url,
    (url: string) => fetch(url).then(res => res.json())
  )

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

  if (error) {
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
        <span className={styles.types} aria-label="The types encountered an error">
          <span 
            className={styles['type']}
            role="term"
            aria-label="Missing type"
          >
            Error
          </span>
        </span>
        {versionClass && <div className={styles['tag-wrap']}>
          <div className={`${styles.tag} ${versionClass}`}></div>
        </div>}
      </div>
    );
  }

  // Get types from the Pokemon data
  const types = pokemonData?.types?.map((type: any) => type.type.name) || [];
  
  // Debug logging
  console.log(`${entry.pokemon_species.name} types:`, types);
  console.log('Pokemon data:', pokemonData);

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

  if (!pokemonData) {
    return <div role="status">No Pokédex data available</div>;
  }

  const name = pokemonData.name;
  const pokémon = pokemonData.pokemon_entries;
  const filteredPokémon = fetchFilteredData(pokémon, query);

  return (
    <div className={styles['list-cont']}>
      <table className={styles['table']} role="table" aria-label={`${capitalizeFirst(name)} Pokédex`}>
        <thead>
          <tr>
            <th scope="colgroup" colSpan={5}><h3 className={styles.heading}>{capitalizeFirst(name)}</h3></th>
          </tr>
        </thead>
      </table>
      <div className="view" role="list">
      {filteredPokémon.map((entry: any) => (
        <PokemonRow key={entry.entry_number} entry={entry} />
      ))}
      </div>
    </div>
  )
}