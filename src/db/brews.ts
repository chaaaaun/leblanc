import { db } from './client';
import { Brew } from './types';
import { BREW_STORE } from './constants';

export const addBrew = (brew: Omit<Brew, 'id'>): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BREW_STORE], 'readwrite');
    const store = transaction.objectStore(BREW_STORE);
    const request = store.add(brew);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const updateBrew = (brew: Brew): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BREW_STORE], 'readwrite');
    const store = transaction.objectStore(BREW_STORE);
    const request = store.put(brew);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getBrew = (id: number): Promise<Brew | undefined> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BREW_STORE], 'readonly');
    const store = transaction.objectStore(BREW_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getBrews = (): Promise<Brew[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BREW_STORE], 'readonly');
    const store = transaction.objectStore(BREW_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getBrewsByBeanId = (beanId: number): Promise<Brew[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BREW_STORE], 'readonly');
    const store = transaction.objectStore(BREW_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const allBrews = request.result as Brew[];
      const relevantBrews = allBrews.filter(b => b.beanIds.includes(beanId));
      resolve(relevantBrews);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteBrew = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BREW_STORE], 'readwrite');
    const store = transaction.objectStore(BREW_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
