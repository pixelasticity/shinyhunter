'use client';

const KEY_PREFIX = 'pokemon-caught-';
const MAX_POKEMON = 1025; // up to Gen IX

// Utility functions for managing caught Pokemon state
export const CaughtManager = {
  // Helper function to pad Pokemon ID with leading zeros
  getStorageKey: (pokemonId: number) => {
    return `${KEY_PREFIX}${String(pokemonId).padStart(3, '0')}`;
  },

  // Get all Pokemon with their states
  getPokemonStates: (): { [key: number]: 'caught' | 'shiny' } => {
    const states: { [key: number]: 'caught' | 'shiny' } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(KEY_PREFIX)) {
        const id = parseInt(key.replace(KEY_PREFIX, ''));
        const state = localStorage.getItem(key) as 'caught' | 'shiny';
        if (state) {
          states[id] = state;
        }
      }
    }
    return states;
  },

  // Get all caught Pokemon IDs (both regular and shiny)
  getCaughtPokemon: (): number[] => {
    return Object.keys(CaughtManager.getPokemonStates()).map(Number).sort((a, b) => a - b);
  },

  // Get only shiny Pokemon IDs
  getShinyPokemon: (): number[] => {
    const states = CaughtManager.getPokemonStates();
    return Object.entries(states)
      .filter(([_, state]) => state === 'shiny')
      .map(([id, _]) => parseInt(id))
      .sort((a, b) => a - b);
  },

  // Get total count of caught Pokemon (both regular and shiny)
  getCaughtCount: (): number => {
    return CaughtManager.getCaughtPokemon().length;
  },

  // Get count of only shiny Pokemon
  getShinyCount: (): number => {
    return CaughtManager.getShinyPokemon().length;
  },

  // Get Pokemon state
  getPokemonState: (id: number): 'none' | 'caught' | 'shiny' => {
    const savedState = localStorage.getItem(CaughtManager.getStorageKey(id));
    return savedState as 'caught' | 'shiny' || 'none';
  },

  // Mark all Pokemon as caught (regular)
  catchAll: (): void => {
    // This would need to be called with the total number of Pokemon
    // For now, we'll use a reasonable upper bound
    for (let i = 1; i <= MAX_POKEMON; i++) {
      localStorage.setItem(CaughtManager.getStorageKey(i), 'caught');
    }
  },

  // Mark all Pokemon as not caught
  releaseAll: (): void => {
    for (let i = 1; i <= MAX_POKEMON; i++) {
      localStorage.removeItem(CaughtManager.getStorageKey(i));
    }
  },

  // Mark Pokemon in a range as caught (regular)
  catchRange: (start: number, end: number): void => {
    for (let i = start; i <= end; i++) {
      localStorage.setItem(CaughtManager.getStorageKey(i), 'caught');
    }
  },

  // Mark Pokemon in a range as shiny
  shinyRange: (start: number, end: number): void => {
    for (let i = start; i <= end; i++) {
      localStorage.setItem(CaughtManager.getStorageKey(i), 'shiny');
    }
  },

  // Export caught data as JSON
  exportData: (): string => {
    const states = CaughtManager.getPokemonStates();
    return JSON.stringify({ states, timestamp: new Date().toISOString() });
  },

  // Import caught data from JSON
  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.states && typeof data.states === 'object') {
        // Clear existing data
        CaughtManager.releaseAll();
        // Set new data
        Object.entries(data.states).forEach(([id, state]) => {
          if (state === 'caught' || state === 'shiny') {
            localStorage.setItem(CaughtManager.getStorageKey(parseInt(id)), state as 'caught' | 'shiny');
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}; 