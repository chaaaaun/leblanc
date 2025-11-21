import { db } from './client';
import { Bean } from './types';
import { BEAN_STORE } from './constants';

export const addBean = (bean: Omit<Bean, 'id'>): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BEAN_STORE], 'readwrite');
    const store = transaction.objectStore(BEAN_STORE);
    const request = store.add(bean);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const updateBean = (bean: Bean): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BEAN_STORE], 'readwrite');
    const store = transaction.objectStore(BEAN_STORE);
    const request = store.put(bean);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getBean = (id: number): Promise<Bean | undefined> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BEAN_STORE], 'readonly');
    const store = transaction.objectStore(BEAN_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getBeans = (): Promise<Bean[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BEAN_STORE], 'readonly');
    const store = transaction.objectStore(BEAN_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteBean = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BEAN_STORE], 'readwrite');
    const store = transaction.objectStore(BEAN_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
