import { useCallback, useSyncExternalStore } from "react";

export function useOnlineStatus(key) {
  const defaultValue = null;
  const getSnapshot = useCallback(() => {
    const token = localStorage.getItem(key) || defaultValue;
    if (token !== null) {
      return token;
    }
    return null;
  }, [key, defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot);
}

function subscribe(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
