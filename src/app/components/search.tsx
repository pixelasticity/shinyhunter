'use client';
 
import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import styles from './search.module.css';
 
function SearchForm({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);
 
  return (
    <form className={styles.form} role="search">
      <div className={styles.box}>
        <label id="search-description"  htmlFor="search" className={styles['sr-only']}>
        Search for Pokemon by name or Pokédex number
        </label>
        <input
          id="search"
          type="search"
          className={styles.input}
          placeholder={placeholder}
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('query')?.toString()}
          aria-describedby="search-description"
        />
        <button type="submit" className={styles.submit}>
          <Image
            className={styles.icon}
            src="/magnifying-glass.svg"
            alt="Search"
            width={24}
            height={24}
            priority
            />
        </button>
      </div>
    </form>
  );
}

export function Search({ placeholder }: { placeholder: string }) {
  return (
    // You could have a loading skeleton as the `fallback` too
    <Suspense>
      <SearchForm placeholder={placeholder} />
    </Suspense>
  )
}
