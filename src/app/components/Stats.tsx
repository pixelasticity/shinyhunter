'use client';

import { useState, useEffect, useMemo } from 'react';
import { CaughtManager } from './CaughtManager';
import styles from './Stats.module.css';

interface PokemonEntry {
  pokemon_species: {
    name: string;
    url: string;
  };
}

interface StatsProps {
  pokemonEntries: PokemonEntry[];
  className?: string;
}

export default function Stats({ pokemonEntries, className = '' }: StatsProps) {
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

  const percentage = totalPokemon > 0 ? ((caughtCount / totalPokemon) * 100).toFixed(1) : 0;

  // Helper function to get Pokemon name by ID
  const getPokemonName = (id: number): string => {
    return `#${id}`;
  };

  return (
    <div className={styles.progression}>
      {totalPokemon > 0 && (
        <>
          <h3>Progress</h3>
          <div className={className}>
            <strong>{caughtCount}</strong> / {totalPokemon} Pokemon caught ({percentage}%)
          </div>
          <div style={{ marginBottom: '10px', fontSize: '0.9em', color: 'var(--text-muted)' }}>
            ✨ <strong>{shinyCount}</strong> shiny Pokemon
          </div>
          <progress className={styles.progress} max={totalPokemon} value={caughtCount}></progress>
          {caughtCount > 0 && (
            <div style={{ marginTop: '10px', fontSize: '0.9em', color: 'var(--text-muted)' }}>
              Recently caught: {caughtPokemon.slice(-5).reverse().map(id => getPokemonName(id)).join(', ')}
            </div>
          )}
        </>
      )}
    </div>
  );
}
