'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './ViewToggle.module.css';

interface ViewToggleProps {
  initialView?: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
}

export default function ViewToggle({ initialView = 'list', onViewChange }: ViewToggleProps) {
  const [currentView, setCurrentView] = useState<'list' | 'grid'>(initialView);

  const handleViewChange = (view: 'list' | 'grid') => {
    setCurrentView(view);
    onViewChange(view);
  };

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${currentView === 'list' ? styles.active : ''}`}
        onClick={() => handleViewChange('list')}
        aria-pressed={currentView === 'list'}
        title={currentView === 'list' ? 'List View': 'Switch to List View'}
      >
        <Image
          src="/list_icon.svg"
          alt="List View"
          width={20}
          height={20}
        />
      </button>
      <button
        className={`${styles.button} ${currentView === 'grid' ? styles.active : ''}`}
        onClick={() => handleViewChange('grid')}
        aria-pressed={currentView === 'grid'}
        title={currentView === 'grid' ? 'Grid View': 'Switch to Grid View'}
      >
        <Image
          src="/grid_icon.svg"
          alt="Grid View"
          width={20}
          height={20}
        />
      </button>
    </div>
  );
}
