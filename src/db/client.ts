import { DB_NAME, DB_VERSION, BEAN_STORE, BREW_STORE } from './constants';

export let db: IDBDatabase;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event);
      reject(event);
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(BEAN_STORE)) {
        db.createObjectStore(BEAN_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(BREW_STORE)) {
        db.createObjectStore(BREW_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const clearDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BEAN_STORE, BREW_STORE], 'readwrite');
    
    transaction.objectStore(BEAN_STORE).clear();
    transaction.objectStore(BREW_STORE).clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const importData = (data: { beans: any[], brews: any[] }): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BEAN_STORE, BREW_STORE], 'readwrite');
    const beanStore = transaction.objectStore(BEAN_STORE);
    const brewStore = transaction.objectStore(BREW_STORE);

    // Clear existing data first? Or merge? 
    // Let's clear to avoid ID conflicts if importing a full backup
    beanStore.clear();
    brewStore.clear();

    data.beans.forEach(bean => beanStore.add(bean));
    data.brews.forEach(brew => brewStore.add(brew));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};
