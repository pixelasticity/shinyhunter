'use client';

import { useState, useEffect } from 'react';
import { CaughtManager } from './CaughtManager';
import useSWR from 'swr';
import styles from './Stats.module.css';

interface StatsProps {
  totalPokemon?: number;
  className?: string;
}

type Pokémon = {
  entry_number: number,
  pokemon_species: {
    name: string
  }
}

export default function Stats({ totalPokemon = 0, className = '' }: StatsProps) {
  const [caughtCount, setCaughtCount] = useState(0);
  const [shinyCount, setShinyCount] = useState(0);
  const [caughtPokemon, setCaughtPokemon] = useState<number[]>([]);

  // Fetch Pokemon data to get names
  const { data: pokemonData } = useSWR('https://pokeapi.co/api/v2/pokedex/31/');

  useEffect(() => {
    const updateStats = () => {
      setCaughtCount(CaughtManager.getCaughtCount());
      setShinyCount(CaughtManager.getShinyCount());
      setCaughtPokemon(CaughtManager.getCaughtPokemon());
    };

    // Update stats on mount
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
  }, []);

  const percentage = totalPokemon === caughtCount ? Math.round((caughtCount / totalPokemon) * 100) : totalPokemon > 0 ? ((caughtCount / totalPokemon) * 100).toFixed(1) : 0;

  // Helper function to get Pokemon name by ID
  const getPokemonName = (id: number): string => {
    if (!pokemonData?.pokemon_entries) return `#${id}`;
    
    const pokemon = pokemonData.pokemon_entries.find((entry: Pokémon) => entry.entry_number === id);
    if (pokemon) {
      return pokemon.pokemon_species.name.charAt(0).toUpperCase() + pokemon.pokemon_species.name.slice(1);
    }
    return `#${id}`;
  };

  return (
    <div className={styles.progression}>
      <h3>Progress</h3>
      <div style={{  }}>
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
    </div>
  );
} 