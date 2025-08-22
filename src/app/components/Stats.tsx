'use client';

import { useState, useEffect, useMemo } from 'react';
import { CaughtManager } from './CaughtManager';
import { useTranslation, Trans } from 'react-i18next';
import styles from './Stats.module.css';
import { StatsProps, Name } from '../lib/types';
import { useBatchedPokemonData } from '../hooks/useBatchedPokemonData';

export default function Stats({
  pokemonEntries,
  pokédex,
  className = ''
}: StatsProps) {
  const { t, i18n } = useTranslation();
  const [caughtCount, setCaughtCount] = useState(0);
  const [shinyCount, setShinyCount] = useState(0);
  const [caughtPokemon, setCaughtPokemon] = useState<number[]>([]);
  const totalPokemon = pokemonEntries.length;

  const nationalIds = useMemo(() => {
    return pokemonEntries.map(entry => {
      const urlParts = entry.pokemon_species.url.split('/');
      return parseInt(urlParts[urlParts.length - 2]);
    });
  }, [pokemonEntries]);

  const pokemonNameMap = useMemo(() => {
    const map = new Map<number, string>();
    pokemonEntries.forEach(entry => {
      const urlParts = entry.pokemon_species.url.split('/');
      const id = parseInt(urlParts[urlParts.length - 2]);
      map.set(id, entry.pokemon_species.name);
    });
    return map;
  }, [pokemonEntries]);

  useEffect(() => {
    const updateStats = () => {
      const caught = nationalIds.filter(id => {
        const state = CaughtManager.getPokemonState(id);
        return state === 'caught' || state === 'shiny';
      });

      const shiny = nationalIds.filter(id => {
        const state = CaughtManager.getPokemonState(id);
        return state === 'shiny';
      });

      setCaughtCount(caught.length);
      setShinyCount(shiny.length);
      setCaughtPokemon(caught);
    };

    // Update stats on mount and when pokemonEntries changes
    updateStats();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateStats();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    window.addEventListener('pokemon-caught-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pokemon-caught-updated', handleStorageChange);
    };
  }, [nationalIds]);

  const percentage = totalPokemon > 0 ? ((caughtCount / totalPokemon) * 100).toFixed(1) : '0';

  // Helper function to get Pokemon name by ID
  const getPokemonName = (id: number): string => {
    return pokemonNameMap.get(id) || `#${id}`;
  };

  const {
      getSpeciesData,
      isLoading: batchLoading,
      error: batchError
  } = useBatchedPokemonData(pokemonEntries);

  const getTranslatedName = (name: string) => {
    const speciesData = getSpeciesData(name);
    const names: Name[] = speciesData?.names || [];
    const nameData = names.find((n: Name) => n.language.name === i18n.language);
    return nameData?.name || name;
  };

  return (
    <div className={styles.progression}>
      {totalPokemon > 0 && (
        <>
          <h3>
            {!totalPokemon ? 'Loading stats...' :
            !caughtCount ? 'Error loading data' :
            t('progress.title')}
          </h3>
          <div className={className}>
            <Trans
              i18nKey="progress.caught"
              values={{ count: caughtCount, total: totalPokemon, percentage }}
              components={{ 1: <strong /> }}
            />
          </div>
          <div className={styles.shiny}>
            <span aria-hidden="true">✨</span> <Trans i18nKey='progress.shinies' values={{ count: shinyCount }}>
              ✨ <strong>0</strong> { t('progress.shinies', {count: shinyCount}) }
            </Trans>
          </div>
          <progress className={styles.progress} max={totalPokemon} value={caughtCount} aria-label={t('progress.label', {count: caughtCount, total: totalPokemon, pokedex: t('pokedex_' + pokédex)})}></progress>
          {caughtCount > 0 && (
            <div className={styles.recent}>
              {t('progress.recentList', { val: caughtPokemon.slice(-5).reverse().map(id => getTranslatedName(getPokemonName(id))) })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
