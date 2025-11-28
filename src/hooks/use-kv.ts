// Polyfill для useKV когда Spark недоступен
import { useState, useEffect } from 'react';

export function useKV<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Всегда используем localStorage (Spark не используется)
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      console.log(`📂 useKV init: key="${key}", hasValue=${!!item}, isLocalStorage=true`);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`❌ Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      console.log(`💾 useKV save: key="${key}", valueSize=${JSON.stringify(value).length} bytes`);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`❌ Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  const updateValue = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
      console.log(`🔄 useKV update: key="${key}", newValueSize=${JSON.stringify(resolved).length} bytes`);
      return resolved;
    });
  };

  return [value, updateValue];
}
