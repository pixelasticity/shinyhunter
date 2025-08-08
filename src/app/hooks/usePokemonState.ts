import { useState, useEffect, useMemo } from 'react';
import { CaughtManager } from '../components/CaughtManager';
import { SCARLET_POKEMON, VIOLET_POKEMON } from '../lib/constants';
import { PokemonState, PokemonSpriteInfo, PokemonInfo } from '../lib/types';

export function usePokemonState(pokemonInfo: PokemonInfo) {
  const { entryNumber, name, nationalId, styles } = pokemonInfo;
  const [pokemonState, setPokemonState] = useState<PokemonState>('none');

  // Update state when localStorage changes
  useEffect(() => {
    const updateState = () => {
      if (nationalId === null) return;
      const currentState = CaughtManager.getPokemonState(nationalId);
      setPokemonState(currentState);
    };

    // Set initial state
    updateState();

    // Listen for state changes
    const handleStateChange = () => {
      updateState();
    };

    window.addEventListener('pokemon-caught-updated', handleStateChange);
    window.addEventListener('storage', handleStateChange);

    return () => {
      window.removeEventListener('pokemon-caught-updated', handleStateChange);
      window.removeEventListener('storage', handleStateChange);
    };
  }, [nationalId]); // Dependency array includes relevant info

  // Memoized sprite info that updates when state changes
  const spriteInfo = useMemo((): PokemonSpriteInfo => {
    const isShiny = pokemonState === 'shiny';
    
    if (nationalId === null) {
      return {
        pokemonState,
        isShiny,
        spritePath: '/placeholder.png',
        altText: 'Loading sprite',
      };
    }

    const spritePath = isShiny 
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/pokemon/other/home/shiny/${nationalId}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/pokemon/other/home/${nationalId}.png`;
    
    const altText = `${name}${isShiny ? ' shiny' : ''} sprite`;
    
    return { pokemonState, isShiny, spritePath, altText };
  }, [pokemonState, name, nationalId]);

  // Helper function to get version class
  const getVersionClass = (): string => {
    if (SCARLET_POKEMON.includes(entryNumber)) {
      return styles?.scarlet || 'scarlet';
    }
    if (VIOLET_POKEMON.includes(entryNumber)) {
      return styles?.violet || 'violet';
    }
    return '';
  };

  // Helper function to format entry number
  const formatEntryNumber = (): string => {
    return `${entryNumber < 10 ? '0' : ''}${entryNumber < 100 ? '0' : ''}${entryNumber}`;
  };

  // Function to cycle through states
  const cycleState = () => {
    if (nationalId === null) return;
    const nextState = pokemonState === 'none' ? 'caught' : pokemonState === 'caught' ? 'shiny' : 'none';
    setPokemonState(nextState);
    
    // Update localStorage using National ID
    const localStorageKey = `pokemon-caught-${String(nationalId).padStart(3, '0')}`;

    if (nextState !== 'none') {
      localStorage.setItem(localStorageKey, nextState);
    } else {
      localStorage.removeItem(localStorageKey);
    }
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('pokemon-caught-updated'));
  };

  // Function to set specific state
  const setState = (newState: PokemonState) => {
    if (nationalId === null) return;
    setPokemonState(newState);
    
    // Update localStorage using National ID
    const localStorageKey = `pokemon-caught-${String(nationalId).padStart(3, '0')}`;

    if (newState !== 'none') {
      localStorage.setItem(localStorageKey, newState);
    } else {
      localStorage.removeItem(localStorageKey);
    }
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('pokemon-caught-updated'));
  };

  return {
    // State
    pokemonState,
    isShiny: pokemonState === 'shiny',
    isCaught: pokemonState !== 'none',
    
    // Sprite info
    spriteInfo,
    
    // UI helpers
    versionClass: getVersionClass(),
    formattedEntryNumber: formatEntryNumber(),
    
    // Actions
    cycleState,
    setState,
  };
}
