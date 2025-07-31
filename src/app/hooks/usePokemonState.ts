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
  entryNumber: number;
  name: string;
  speciesUrl: string;
  styles?: { [key: string]: string }; // CSS modules styles object
}

// Version-specific Pokemon arrays
const SCARLET_POKEMON = [143, 144, 166, 226, 227, 313, 316, 317, 318, 319, 337, 338, 370, 371, 372, 376, 377, 378, 379, 380, 381, 397, 399];
const VIOLET_POKEMON = [114, 115, 139, 140, 167, 276, 277, 278, 305, 306, 307, 314, 320, 339, 340, 382, 383, 384, 385, 386, 387, 398, 400];

export function usePokemonState(pokemonInfo: PokemonInfo) {
  const [pokemonState, setPokemonState] = useState<PokemonState>('none');

  // Update state when localStorage changes
  useEffect(() => {
    const updateState = () => {
      const currentState = CaughtManager.getPokemonState(pokemonInfo.entryNumber);
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
  }, [pokemonInfo.entryNumber]);

  // Memoized sprite info that updates when state changes
  const spriteInfo = useMemo((): PokemonSpriteInfo => {
    const isShiny = pokemonState === 'shiny';
    const pokemonId = pokemonInfo.speciesUrl.split('/')[6];
    
    const spritePath = isShiny 
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/pokemon/other/home/shiny/${pokemonId}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/pokemon/other/home/${pokemonId}.png`;
    
    const altText = `${pokemonInfo.name}${isShiny ? ' shiny' : ''} sprite`;
    
    return { pokemonState, isShiny, spritePath, altText };
  }, [pokemonState, pokemonInfo.speciesUrl, pokemonInfo.name]);

  // Helper function to get version class
  const getVersionClass = (): string => {
    if (SCARLET_POKEMON.includes(pokemonInfo.entryNumber)) {
      return pokemonInfo.styles?.scarlet || 'scarlet';
    }
    if (VIOLET_POKEMON.includes(pokemonInfo.entryNumber)) {
      return pokemonInfo.styles?.violet || 'violet';
    }
    return '';
  };

  // Helper function to format entry number
  const formatEntryNumber = (): string => {
    return `${pokemonInfo.entryNumber < 10 ? '0' : ''}${pokemonInfo.entryNumber < 100 ? '0' : ''}${pokemonInfo.entryNumber}`;
  };

  // Function to cycle through states
  const cycleState = () => {
    const nextState = pokemonState === 'none' ? 'caught' : pokemonState === 'caught' ? 'shiny' : 'none';
    setPokemonState(nextState);
    
    // Update localStorage
    if (nextState !== 'none') {
      localStorage.setItem(`pokemon-caught-${String(pokemonInfo.entryNumber).padStart(3, '0')}`, nextState);
    } else {
      localStorage.removeItem(`pokemon-caught-${String(pokemonInfo.entryNumber).padStart(3, '0')}`);
    }
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('pokemon-caught-updated'));
  };

  // Function to set specific state
  const setState = (newState: PokemonState) => {
    setPokemonState(newState);
    
    // Update localStorage
    if (newState !== 'none') {
      localStorage.setItem(`pokemon-caught-${String(pokemonInfo.entryNumber).padStart(3, '0')}`, newState);
    } else {
      localStorage.removeItem(`pokemon-caught-${String(pokemonInfo.entryNumber).padStart(3, '0')}`);
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