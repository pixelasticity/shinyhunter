'use client';

import { useRef } from 'react';
import { Tab } from './Tab';
import styles from './Tabs.module.css';

interface TabsProps {
  tabs: {
    label: string;
    url: string;
    name: string;
  }[];
  activeTab: string;
  onTabChange: (url: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let flag = false;
    let nextIndex = index;

    const focusTab = (i: number) => {
      const nextTab = tabRefs.current[i];
      if (nextTab) {
        nextTab.focus();
        onTabChange(tabs[i].url);
      }
    };

    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = (index - 1 + tabs.length) % tabs.length;
        focusTab(nextIndex);
        flag = true;
        break;

      case 'ArrowRight':
        nextIndex = (index + 1) % tabs.length;
        focusTab(nextIndex);
        flag = true;
        break;

      case 'Home':
        focusTab(0);
        flag = true;
        break;

      case 'End':
        focusTab(tabs.length - 1);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  };

  return (
    <div className={styles.tabs} role="tablist" aria-labelledby=''>
      {tabs.map((tab, index) => (
        <Tab
          key={tab.url}
          ref={el => { tabRefs.current[index] = el; }}
          index={index}
          label={tab.label}
          isActive={activeTab === tab.url}
          onClick={() => onTabChange(tab.url)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        />
      ))}
    </div>
  );
}
