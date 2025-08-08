'use client';

import { useState, useEffect } from 'react';
import styles from './Checkbox.module.css';
import { CaughtManager } from './CaughtManager';
import { PokemonState } from '../hooks/usePokemonState';

// The Checkbox component's props
interface CheckboxProps {
  id: string | number;
  name?: string;
  className?: string;
}

// The Icon component to display the checkmark and star icons
const Icon = ({ state }: { state: PokemonState }) => {
  switch (state) {
    case 'caught':
      return <>✓</>;
    case 'shiny':
      return <>✨</>;
    default:
      return null;
  }
};

export default function Checkbox({
  id,
  name = '',
  className = '',
}: CheckboxProps) {
  const [pokemonState, setPokemonState] = useState<PokemonState>('none');

  useEffect(() => {
    const updateState = () => {
      if (id === undefined || id === null) return;
      const currentState = CaughtManager.getPokemonState(Number(id));
      setPokemonState(currentState);
    };

    updateState();

    const handleStateChange = () => {
      updateState();
    };

    window.addEventListener('pokemon-caught-updated', handleStateChange);
    window.addEventListener('storage', handleStateChange);

    return () => {
      window.removeEventListener('pokemon-caught-updated', handleStateChange);
      window.removeEventListener('storage', handleStateChange);
    };
  }, [id]);

  // The function to call when the button is clicked
  const handleClick = () => {
    if (id === undefined || id === null) return;
    const nextState = pokemonState === 'none' ? 'caught' : pokemonState === 'caught' ? 'shiny' : 'none';
    const key = CaughtManager.getStorageKey(Number(id));
    if (nextState === 'none') {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, nextState);
    }
    window.dispatchEvent(new CustomEvent('pokemon-caught-updated'));
  };

  // The label for the button
  const label = `Mark ${name} as ${
    pokemonState === 'none' ? 'caught' : pokemonState === 'caught' ? 'shiny' : 'not caught'
  }`;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${className} ${styles.checkbox} ${styles[pokemonState]}`}
      aria-label={label}
    >
      <Icon state={pokemonState} />
    </button>
  );
}
