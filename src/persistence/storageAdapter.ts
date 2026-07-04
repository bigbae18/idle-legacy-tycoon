export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** Wrapper real sobre localStorage. Inyectable: los tests usan un adapter en memoria en su lugar. */
export const localStorageAdapter: StorageAdapter = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
}
