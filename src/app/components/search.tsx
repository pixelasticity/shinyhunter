'use client';
 
import Image from "next/image";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Suspense, useCallback, useRef } from 'react';
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

  // Create a ref to hold the timeout ID
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((term: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      handleSearch(term);
    }, 300);
  }, [handleSearch]);
 
  return (
    <form className={styles.form}>
      <div className={styles.box}>
        <label id="search-description"  htmlFor="search" className={styles['sr-only']}>
        Search for Pokemon by name or Pokédex number
        </label>
        <Suspense fallback="Loading&hellip;">
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
        </Suspense>
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