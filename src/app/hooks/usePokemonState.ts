import { useState, useEffect, useMemo } from 'react';
import { CaughtManager } from '../components/CaughtManager';

export type PokemonState = 'none' | 'caught' | 'shiny';

interface PokemonSpriteInfo {
  pokemonState: PokemonState;
  isShiny: boolean;
  spritePath: string;
  altText: string;
}

interface PokemonInfo {
  entryNumber: number; // Kept for version class and formatting
  name: string;
  nationalId: number | null;
  styles?: { [key: string]: string }; // CSS modules styles object
}

// Version-specific Pokemon arrays
const SCARLET_POKEMON = [143, 144, 166, 226, 227, 313, 316, 317, 318, 319, 337, 338, 370, 371, 372, 376, 377, 378, 379, 380, 381, 397, 399];
const VIOLET_POKEMON = [114, 115, 139, 140, 167, 276, 277, 278, 305, 306, 307, 314, 320, 339, 340, 382, 383, 384, 385, 386, 387, 398, 400];

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
