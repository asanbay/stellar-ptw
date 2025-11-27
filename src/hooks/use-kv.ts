// Polyfill для useKV когда Spark недоступен
import { useState, useEffect } from 'react';

export function useKV<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Проверяем доступен ли Spark
  const isSparkAvailable = typeof window !== 'undefined' && 
    window.location.hostname === 'localhost';

  // Если Spark доступен, используем оригинальный useKV
  if (isSparkAvailable) {
    try {
      // @ts-ignore
      const { useKV: sparkUseKV } = require('@github/spark/hooks');
      return sparkUseKV(key, initialValue);
    } catch (e) {
      // Fallback to localStorage
    }
  }

  // Fallback: используем localStorage
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  const updateValue = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
      return resolved;
    });
  };

  return [value, updateValue];
}
