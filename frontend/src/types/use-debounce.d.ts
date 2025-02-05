declare module 'use-debounce' {
    export function useDebounce<T>(value: T, delay: number): [T];
    export function useDebouncedCallback<T extends (...args: any[]) => any>(
      callback: T,
      delay: number
    ): T;
  }