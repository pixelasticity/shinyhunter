'use client';
 
import Image from "next/image";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import styles from './search.module.css';
 
export default function Search({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set('query', term);
      } else {
        params.delete('query');
      }
      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace]
  );

  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (term: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handleSearch(term), 300);
      };
    })(),
    [handleSearch]
  );
 
  return (
    <form className={styles.form}>
      <div className={styles.box}>
        <label id="search-description"  htmlFor="search" className={styles['sr-only']}>
        Search for Pokemon by name or Pokédex number
        </label>
        <input
          id="search"
          type="search"
          className={styles.input}
          placeholder={placeholder}
          onChange={(e) => {
            debouncedSearch(e.target.value);
          }}
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