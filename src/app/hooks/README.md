# usePokemonState Custom Hook

A React custom hook that manages Pokemon state, sprite information, and related utilities for the Pokemon tracking application.

## Usage

```tsx
import { usePokemonState } from '../hooks/usePokemonState';

function PokemonComponent({ entry }) {
  const {
    pokemonState,
    isShiny,
    isCaught,
    spriteInfo,
    versionClass,
    formattedEntryNumber,
    cycleState,
    setState
  } = usePokemonState({
    entryNumber: entry.entry_number,
    name: entry.pokemon_species.name,
    speciesUrl: entry.pokemon_species.url,
    styles // Pass your CSS modules styles object
  });

  return (
    <div className={versionClass}>
      <img src={spriteInfo.spritePath} alt={spriteInfo.altText} />
      <span>{formattedEntryNumber}</span>
      <button onClick={cycleState}>
        {pokemonState === 'caught' && '✓'}
        {pokemonState === 'shiny' && '✨'}
      </button>
    </div>
  );
}
```

## API

### Input
```tsx
interface PokemonInfo {
  entryNumber: number;
  name: string;
  speciesUrl: string;
  styles?: { [key: string]: string }; // Optional CSS modules styles object
}
```

### Output
```tsx
{
  // State
  pokemonState: 'none' | 'caught' | 'shiny';
  isShiny: boolean;
  isCaught: boolean;
  
  // Sprite info
  spriteInfo: {
    pokemonState: 'none' | 'caught' | 'shiny';
    isShiny: boolean;
    spritePath: string;
    altText: string;
  };
  
  // UI helpers
  versionClass: string; // Scoped class name for version styling (e.g., 'list_scarlet__abc123')
  formattedEntryNumber: string; // '001', '025', etc.
  
  // Actions
  cycleState: () => void;
  setState: (state: PokemonState) => void;
}
```

## Features

- **Automatic state synchronization** with localStorage
- **Real-time updates** when state changes
- **Sprite path management** (regular vs shiny)
- **Version-specific styling** (Scarlet/Violet exclusives) with CSS module scoping
- **Formatted entry numbers** with leading zeros
- **Accessibility support** with proper alt text
- **Event listening** for cross-tab synchronization

## State Management

The hook automatically:
- Loads initial state from localStorage
- Listens for state changes and updates accordingly
- Dispatches events to notify other components
- Handles cross-tab synchronization

## Benefits

- **DRY principle** - No repeated state logic
- **Separation of concerns** - State logic separated from UI
- **Reusability** - Can be used in any component
- **Type safety** - Full TypeScript support
- **Performance** - Efficient state updates 