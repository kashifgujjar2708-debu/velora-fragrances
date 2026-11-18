const STORAGE_PREFIX = 'velora_fragrances_v1_';

export const storageService = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  write<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch {
      // Ignore quota errors in restricted preview sandboxes
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch {
      // Ignore
    }
  },
};
