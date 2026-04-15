import type { Storage } from "../types/index.js";

export type CreateStorageParameters = {
  storage: Storage | null;
};

export function createStorage(
  parameters: CreateStorageParameters
): Storage | null {
  return parameters.storage;
}

export function getDefaultStorage(): Storage {
  return {
    getItem: (key: string) => {
      if (typeof window === "undefined") return null;
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    },
    setItem: (key: string, value: any) => {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: (key: string) => {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    },
  };
}

export const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
