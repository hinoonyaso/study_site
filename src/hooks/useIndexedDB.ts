import { useState, useEffect, useCallback } from "react";

const DB_NAME = "physical-ai-db";
const DB_VERSION = 1;
const STORE_NAME = "keyval";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function get<T>(key: string): Promise<T | undefined> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

function set(key: string, value: any): Promise<void> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export function useIndexedDB<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const item = await get<T>(key);
        if (item !== undefined) {
          setStoredValue(item);
        } else {
          // Migration from localStorage
          const localItem = window.localStorage.getItem(key);
          if (localItem) {
            const parsed = JSON.parse(localItem);
            setStoredValue(parsed);
            await set(key, parsed); // Save to IndexedDB
            console.log("Migrated data from localStorage to IndexedDB");
          } else {
            await set(key, initialValue);
          }
        }
      } catch (error) {
        console.warn(`Error reading IndexedDB key "${key}":`, error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        set(key, valueToStore).catch((error) => {
          console.warn(`Error setting IndexedDB key "${key}":`, error);
        });
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue, isLoaded] as const;
}
