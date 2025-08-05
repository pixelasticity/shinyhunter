'use client';

import styles from './Checkbox.module.css';
import { usePokemonState, PokemonState } from '../hooks/usePokemonState';

// The Checkbox component's props
interface CheckboxProps {
  id: string | number;
  name?: string;
  speciesUrl?: string;
  state?: PokemonState; // The initial state of the checkbox
  onChange?: (state: PokemonState) => void; // The function to call when the state changes
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
  speciesUrl = '',
  state: initialState,
  onChange,
  className = '',
}: CheckboxProps) {
  // Use the custom hook for Pokemon state management
  const { pokemonState, cycleState } = usePokemonState({
    entryNumber: Number(id),
    name,
    speciesUrl,
  });

  // Use the hook's state if no initial state is provided
  const currentState = initialState ?? pokemonState;

  // The function to call when the button is clicked
  const handleClick = () => {
    if (onChange) {
      const nextState = currentState === 'none' ? 'caught' : currentState === 'caught' ? 'shiny' : 'none';
      onChange(nextState);
    } else {
      cycleState();
    }
  };

  // The label for the button
  const label = `Mark ${id} as ${
    currentState === 'none' ? 'caught' : currentState === 'caught' ? 'shiny' : 'not caught'
  }`;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${className} ${styles.checkbox} ${styles[currentState]}`}
      aria-label={label}
    >
      <Icon state={currentState} />
    </button>
  );
}
