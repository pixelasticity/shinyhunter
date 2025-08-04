import Image from "next/image";
import Checkbox from "./Checkbox";
import useSWR from 'swr';
import { capitalizeFirst } from "../lib/utils";
import styles from "./list-item.module.css";

import { usePokemonState } from '../hooks/usePokemonState';

type Pokémon = {
    entry_number: number,
    pokemon_species: {
        name: string,
        url: string
    }
}

type PokémonTypes = {
    type: {
        name: string
    }
}

export default function ListItem({entry}: {entry: Pokémon}) {
    // Use the custom hook for Pokemon state management
    const {
        spriteInfo,
        versionClass,
        formattedEntryNumber
    } = usePokemonState({
        entryNumber: entry.entry_number,
        name: entry.pokemon_species.name,
        speciesUrl: entry.pokemon_species.url,
        styles
    });

    // Convert species URL to Pokemon URL to get types
    // Species URL: https://pokeapi.co/api/v2/pokemon-species/1/
    // Pokemon URL: https://pokeapi.co/api/v2/pokemon/1/
    const pokemonUrl = entry.pokemon_species.url.replace('pokemon-species', 'pokemon');

    // Fetch individual Pokemon data using the Pokemon URL
    const { data: pokemonData, error, isLoading } = useSWR(
        pokemonUrl,
        (url: string) => fetch(url).then(res => res.json())
    );

    // Get types from the Pokemon data
    const types = pokemonData?.types?.map((type: PokémonTypes) => type.type.name) || [];

    return (
        <div style={{ maxWidth: '768px', marginInline: 'auto', borderRadius: '64px 16px 16px 64px', backgroundColor: '#f2f2f2', backgroundImage: 'linear-gradient(100deg, #e8e8e8, #fcfcfc)', backgroundRepeat: 'no-repeat', gap: '0 24px', display: 'grid',gridTemplateColumns: '128px 1fr 128px', gridTemplateRows: 'repeat(2, 64px)', justifyContent: 'start', alignItems: 'center', boxShadow: '0 2px 5px rgba(0 0 0 / 15%)', position: 'relative', overflow: 'hidden' }} key={entry.entry_number} className={versionClass}>
            <div className="sprite" style={{ gridRow: '1 / 2', alignSelf: 'flex-start', padding: '32px', backgroundImage: 'radial-gradient(rgba(255 255 255 / 60%) 60%, rgba(31 31 31 / 8%) 60%, rgba(0 0 0 / 8%) 70%, transparent 71%)' }}>
                <Image src={spriteInfo.spritePath} alt="" height={64} width={64} style={{ color: 'transparent', display: 'block' }} />
            </div>
            <div className="copy" style={{ justifySelf: 'auto', display: 'flex', gap: '24px',alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '36px', lineHeight: 1.333 }}>{capitalizeFirst(entry.pokemon_species.name)}</h3>
                <span className="number" style={{ fontSize: '24px', color: '#616161' }}>
                    <span style={{ fontSize: '0.875em', color: '#919191' }}>#</span>{formattedEntryNumber}
                </span>
            </div>
            <span className={styles.types} aria-label={`Types: ${types.map((type: string) => capitalizeFirst(type)).join(', ')}`} style={{ gridColumn: '2 / 3', gridRow: '2 / 3',marginLeft: '0' }}>
            {types.map((type: string) => (
                <span 
                    key={type} 
                    className={`${styles['type']} ${styles[type]}`}
                    role="term"
                    aria-label={`${capitalizeFirst(type)} type`}
                >
                    {capitalizeFirst(type)}
                </span>
            ))}
            </span>
            <Checkbox id={entry.entry_number} name={entry.pokemon_species.name} speciesUrl={entry.pokemon_species.url} />
        </div>
    );
}