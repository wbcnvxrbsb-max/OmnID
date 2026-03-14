import { useState, useEffect } from "react";

/**
 * Like useState, but backed by localStorage.
 * State survives page reloads, tab closes, and reboots.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storageKey = `omnid-${key}`;

  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — silently fail
    }
  }, [storageKey, state]);

  return [state, setState];
}
