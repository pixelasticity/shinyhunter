'use client';

import styles from './Checkbox.module.css';
import { usePokemonState, PokemonState } from '../hooks/usePokemonState';

interface CheckboxProps {
  id: string | number;
  name?: string;
  speciesUrl?: string;
  state?: PokemonState;
  onChange?: (state: PokemonState) => void;
  className?: string;
  styles?: { [key: string]: string };
}

export default function Checkbox({ id, name = '', speciesUrl = '', state: initialState = 'none', onChange, className = '' }: CheckboxProps) {
  // Use the custom hook for Pokemon state management
  const {
    pokemonState,
    cycleState,
    setState
  } = usePokemonState({
    entryNumber: Number(id),
    name,
    speciesUrl,
    styles
  });

  // Use the hook's state if no initial state is provided
  const currentState = initialState !== 'none' ? initialState : pokemonState;

  const handleClick = () => {
    if (initialState !== 'none') {
      // If we have an initial state, cycle through states
      const nextState = currentState === 'none' ? 'caught' : currentState === 'caught' ? 'shiny' : 'none';
      onChange?.(nextState);
    } else {
      // Use the hook's cycle function
      cycleState();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${className} ${styles.checkbox} ${styles[currentState]}`}
      aria-label={`Mark ${id} as ${currentState === 'none' ? 'caught' : currentState === 'caught' ? 'shiny' : 'not caught'}`}
    >
      {currentState === 'caught' && '✓'}
      {currentState === 'shiny' && '✨'}
    </button>
  );
} 