import { useEffect, useState } from 'react';

export function useTimeout(ms?: number) {
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), ms);

    return () => clearTimeout(id);
  }, [ms]);

  return isReady;
}
