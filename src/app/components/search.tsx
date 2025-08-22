'use client';
 
import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import styles from './search.module.css';
 
function SearchForm({ placeholder }: { placeholder: string }) {
  const { t } = useTranslation();
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
          {t('search.label')}
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
        {searchParams.get('query') && <input type="reset" value={t('search.clear')} className={styles.reset} accessKey="r" onClick={() => handleSearch('')} />}
        <button type="submit" className={styles.submit}>
          <Image
            className={styles.icon}
            src="/magnifying-glass.svg"
            alt={t('search.alt')}
            width={24}
            height={24}
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
