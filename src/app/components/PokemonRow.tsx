'use client';

import Image from 'next/image';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './list.module.css';
import Checkbox from './Checkbox';
import { usePokemonState } from '../hooks/usePokemonState';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { capitalizeFirst } from '../lib/utils';
import { PokemonEntry, Name, Types, PokemonData, SpeciesData, TypeData } from '../lib/types';
import placeholder from '../../../public/placeholder.png';

type BatchedData = {
  getPokemonData: (name: string) => PokemonData | undefined;
  getSpeciesData: (name: string) => SpeciesData | undefined;
  getTypeData: (name: string) => TypeData | undefined;
};

// Component to display individual Pokemon data with batched data
export default function PokemonRow({
  entry,
  getPokemonData,
  getSpeciesData,
  getTypeData,
  batchLoading,
}: {
  entry: PokemonEntry;
  batchLoading: boolean;
} & BatchedData) {
  const { t, i18n } = useTranslation();
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
    names: speciesData?.names || [],
    nationalId,
  });

  // Get color from the species data
  const color = speciesData?.color?.name || '';
  const types = pokemonData?.types?.map((type: Types) => type.type.name) || [];
  const names = speciesData?.names || [];
  const translatedName = useMemo(() => {
    const nameData = names.find((name: Name) => name.language.name === i18n.language);
    return nameData?.name || pokemonName; // Fallback to the default name
  }, [names, i18n.language, pokemonName]);

  const translatedTypes = useMemo(() => {
    return types.map((typeName: string) => {
      const typeData = getTypeData(typeName);
      const translatedType = typeData?.names.find((name: Name) => name.language.name === i18n.language);
      return translatedType?.name || capitalizeFirst(typeName);
    });
  }, [types, getTypeData, i18n.language]);

  const isDataMissing = !pokemonData;

  return (
    <div ref={ref} key={entry.entry_number} className={`${styles['pokemon']} ${styles[color]}`}>
      <div className={styles.checkbox} >
        <Checkbox id={nationalId || 0} name={pokemonName} />
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
          <Image alt="" width={64} height={64} src={placeholder} />
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{batchLoading ? (
          <span>{t('loading')}</span>
        ) : isDataMissing ? (
          <span>{t('unknown')}</span>
        ) : (
          <span lang={i18n.language}>{translatedName}</span>
        )}</h3>
        <span className={styles.number}>
          <span className={styles.hash}><span className="visually-hidden">{t('number')}</span><span role='presentation'>#</span></span>{formattedEntryNumber}
        </span>
      </div>
      <span className={styles.types} aria-label={
        batchLoading
          ? t('loading')
          : isDataMissing
            ? t('unknown')
            : `${t('types')}: ${translatedTypes.join(', ')}`
      }>
        {batchLoading ? (
          <span className={styles['type']} role="term">{t('loading')}</span>
        ) : isDataMissing ? (
          <span className={styles['type']} role="term" aria-label="Missing type">{t('unknown')}</span>
        ) : (
          translatedTypes.map((type: string, index: number) => (
            <span
              key={type}
              className={`${styles['type']} ${styles[types[index]]}`}
              role="term"
              aria-label={`${type} type`}
            >
              {type}
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
