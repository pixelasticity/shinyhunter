'use client';

import Image from 'next/image';
import { useMemo, useRef } from 'react';
import styles from './list.module.css';
import Checkbox from './Checkbox';
import { usePokemonState } from '../hooks/usePokemonState';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { capitalizeFirst } from '../lib/utils';
import { PokemonEntry, Types } from '../lib/types';

// Component to display individual Pokemon data with batched data
export default function PokemonRow({
  entry,
  getPokemonData,
  getSpeciesData,
  batchLoading,
}: {
  entry: PokemonEntry;
  getPokemonData: (name: string) => any;
  getSpeciesData: (name: string) => any;
  batchLoading: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const options = useMemo(() => ({ rootMargin: '200px' }), []);
  const isIntersecting = useIntersectionObserver(ref, options);

  const pokemonName = entry.pokemon_species.name;
  const pokemonData = getPokemonData(pokemonName);
  const speciesData = getSpeciesData(pokemonName);
  const nationalId = pokemonData?.id;

  // Use the custom hook for Pokemon state management
  const {
    spriteInfo,
    versionClass,
    formattedEntryNumber
  } = usePokemonState({
    entryNumber: entry.entry_number,
    name: pokemonName,
    nationalId,
    styles
  });

  // Get color from the species data
  const color = speciesData?.color?.name || null;
  const types = pokemonData?.types?.map((type: Types) => type.type.name) || [];
  const isDataMissing = !pokemonData;

  return (
    <div ref={ref} key={entry.entry_number} className={`${styles['pokemon']} ${styles[color]}`}>
      <div className={styles.checkbox} >
        <Checkbox id={nationalId} name={pokemonName} />
      </div>
      <div className={styles.sprite}>
        {isIntersecting ? (
          <Image
            src={spriteInfo.spritePath}
            alt={spriteInfo.altText}
            height={64}
            width={64}
            priority={entry.entry_number <= 20} // Prioritize first 20 images for LCP
          />
        ) : (
          <Image alt="" width="64" height="64" src="/placeholder.png" />
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{capitalizeFirst(entry.pokemon_species.name)}</h3>
        <span className={styles.number}>
          <span className={styles.hash}><span className="visually-hidden">Number</span><span role='presentation'>#</span></span>{formattedEntryNumber}
        </span>
      </div>
      <span className={styles.types} aria-label={
        batchLoading
          ? "The types are loading"
          : isDataMissing
            ? "Types unavailable"
            : `Types: ${types.map((type: string) => capitalizeFirst(type)).join(', ')}`
      }>
        {batchLoading ? (
          <span className={styles['type']} role="term">Loading&hellip;</span>
        ) : isDataMissing ? (
          <span className={styles['type']} role="term" aria-label="Missing type">Unknown</span>
        ) : (
          types.map((type: string) => (
            <span
              key={type}
              className={`${styles['type']} ${styles[type]}`}
              role="term"
              aria-label={`${capitalizeFirst(type)} type`}
            >
              {capitalizeFirst(type)}
            </span>
          ))
        )}
      </span>
      {versionClass && <div className={styles['tag-wrap']}>
        <div className={`${styles.tag} ${versionClass}`}></div>
      </div>}
    </div>
  );
};
