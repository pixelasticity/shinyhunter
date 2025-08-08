'use client';

import { PokemonState } from '../lib/types';

const STORAGE_KEY = 'pokemon-caught-states';
const MAX_POKEMON = 1025; // up to Gen IX
const BITS_PER_POKEMON = 2;
const POKEMON_PER_INT = 16;

const stateToBits: { [key in PokemonState]: number } = {
  none: 0,
  caught: 1,
  shiny: 2,
};

const bitsToState: { [key: number]: PokemonState } = {
  0: 'none',
  1: 'caught',
  2: 'shiny',
};

const base64ToUint32Array = (base64: string): Uint32Array => {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i+=1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Uint32Array(bytes.buffer);
  } catch (e) {
    console.error("Failed to decode base64 string from localStorage", e);
    return new Uint32Array(Math.ceil(MAX_POKEMON / POKEMON_PER_INT));
  }
};

const uint32ArrayToBase64 = (array: Uint32Array): string => {
  const bytes = new Uint8Array(array.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i+=1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Utility functions for managing caught Pokemon state
export const CaughtManager = {
  initialize: () => {
    // No-op, since we are not migrating data
  },

  getPokemonStates: (): Uint32Array => {
    const base64 = localStorage.getItem(STORAGE_KEY);
    if (base64) {
      return base64ToUint32Array(base64);
    }
    const array = new Uint32Array(Math.ceil(MAX_POKEMON / POKEMON_PER_INT));
    return array;
  },

  setPokemonState: (id: number, state: PokemonState) => {
    const states = CaughtManager.getPokemonStates();
    const index = Math.floor((id - 1) / POKEMON_PER_INT);
    const bitPosition = ((id - 1) % POKEMON_PER_INT) * BITS_PER_POKEMON;
    const bits = stateToBits[state];

    states[index] =
      (states[index] & ~(3 << bitPosition)) | (bits << bitPosition);

    localStorage.setItem(STORAGE_KEY, uint32ArrayToBase64(states));
    window.dispatchEvent(new CustomEvent('pokemon-caught-updated'));
  },

  getCaughtPokemon: (): number[] => {
    const states = CaughtManager.getPokemonStates();
    const caught: number[] = [];
    for (let i = 1; i <= MAX_POKEMON; i++) {
      if (CaughtManager.getPokemonState(i, states) !== 'none') {
        caught.push(i);
      }
    }
    return caught;
  },

  getShinyPokemon: (): number[] => {
    const states = CaughtManager.getPokemonStates();
    const shiny: number[] = [];
    for (let i = 1; i <= MAX_POKEMON; i++) {
      if (CaughtManager.getPokemonState(i, states) === 'shiny') {
        shiny.push(i);
      }
    }
    return shiny;
  },

  getCaughtCount: (): number => {
    return CaughtManager.getCaughtPokemon().length;
  },

  getShinyCount: (): number => {
    return CaughtManager.getShinyPokemon().length;
  },

  getPokemonState: (id: number, states?: Uint32Array): PokemonState => {
    states = states || CaughtManager.getPokemonStates();
    const index = Math.floor((id - 1) / POKEMON_PER_INT);
    const bitPosition = ((id - 1) % POKEMON_PER_INT) * BITS_PER_POKEMON;
    const bits = (states[index] >> bitPosition) & 3;
    return bitsToState[bits] || 'none';
  },

  catchAll: (): void => {
    const states = new Uint32Array(Math.ceil(MAX_POKEMON / POKEMON_PER_INT));
    for (let i = 1; i <= MAX_POKEMON; i++) {
      const index = Math.floor((i - 1) / POKEMON_PER_INT);
      const bitPosition = ((i - 1) % POKEMON_PER_INT) * BITS_PER_POKEMON;
      states[index] |= 1 << bitPosition;
    }
    localStorage.setItem(STORAGE_KEY, uint32ArrayToBase64(states));
    window.dispatchEvent(new CustomEvent('pokemon-caught-updated'));
  },

  releaseAll: (): void => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('pokemon-caught-updated'));
  },

  catchRange: (start: number, end: number): void => {
    const states = CaughtManager.getPokemonStates();
    for (let i = start; i <= end; i++) {
      const index = Math.floor((i - 1) / POKEMON_PER_INT);
      const bitPosition = ((i - 1) % POKEMON_PER_INT) * BITS_PER_POKEMON;
      states[index] =
        (states[index] & ~(3 << bitPosition)) | (1 << bitPosition);
    }
    localStorage.setItem(STORAGE_KEY, uint32ArrayToBase64(states));
    window.dispatchEvent(new CustomEvent('pokemon-caught-updated'));
  },

  shinyRange: (start: number, end: number): void => {
    const states = CaughtManager.getPokemonStates();
    for (let i = start; i <= end; i++) {
      const index = Math.floor((i - 1) / POKEMON_PER_INT);
      const bitPosition = ((i - 1) % POKEMON_PER_INT) * BITS_PER_POKEMON;
      states[index] =
        (states[index] & ~(3 << bitPosition)) | (2 << bitPosition);
    }
    localStorage.setItem(STORAGE_KEY, uint32ArrayToBase64(states));
    window.dispatchEvent(new CustomEvent('pokemon-caught-updated'));
  },

  exportData: (): string => {
    const states = CaughtManager.getPokemonStates();
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      data: uint32ArrayToBase64(states),
    });
  },

  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.data && typeof data.data === 'string') {
        localStorage.setItem(STORAGE_KEY, data.data);
        window.dispatchEvent(new CustomEvent('pokemon-caught-updated'));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },
};
