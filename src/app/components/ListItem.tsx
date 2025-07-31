import Image from "next/image";

export default function ListItem({entry}: {entry: any}) {
    return (
        <div style={{ maxWidth: '768px', marginInline: 'auto', borderRadius: '64px 16px 16px 64px', backgroundColor: '#f2f2f2', backgroundImage: 'linear-gradient(100deg, #e8e8e8, #fcfcfc)', backgroundRepeat: 'no-repeat', gap: '0 24px', display: 'grid',gridTemplateColumns: '128px 1fr 128px', gridTemplateRows: 'repeat(2, 64px)', justifyContent: 'start', alignItems: 'center', boxShadow: '0 2px 5px rgba(0 0 0 / 15%)', position: 'relative', overflow: 'hidden' }} key={entry.entry_number} className={versionClass}>
            <div className="sprite" style={{ gridRow: '1 / 2', alignSelf: 'flex-start', padding: '32px', backgroundImage: 'radial-gradient(rgba(255 255 255 / 60%) 60%, rgba(31 31 31 / 8%) 60%, rgba(0 0 0 / 8%) 70%, transparent 71%)' }}>
                <Image src={} alt={} height={64} width={64} style={{ color: 'transparent', display: 'block' }} />
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
            <Checkbox id={entry.entry_number} name={entry.pokemon_species.name} speciesUrl={entry.pokemon_species.url} style={{ gridRow: '1 / 3', gridColumn: '3 / 4',marginLeft: 'calc(64px - 12.5px)', borderRadius: '0 4px' }} />
        </div>
    );
}