'use client';

import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Tab.module.css';

interface TabProps {
  index: number;
  label: string;
  isActive: boolean;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ index, label, isActive, onClick, onKeyDown }, ref) => {
    const { t } = useTranslation();
    return (
      <button
        ref={ref}
        id={`tab-${index + 1}`}
        className={`${styles.tab} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${index + 1}`}
      tabIndex={isActive ? 0 : -1}
    >
        <span className='focus'>
            {t(label)}
        </span>
    </button>
    );
  }
);

Tab.displayName = 'Tab';
