import { useLocalStorageValue } from '@react-hookz/web';

import type { VisDef } from '../vis-packs/models';

export function useActiveVis<T extends VisDef>(
  supportedVis: T[]
): [T, (v: T) => void] {
  const lastVis = supportedVis[supportedVis.length - 1];

  const [storedVisName, setStoredVisName] = useLocalStorageValue(
    'h5web:visName',
    lastVis.name,
    {
      handleStorageEvent: true,
      storeDefaultValue: true,
    }
  );

  const activeVis =
    supportedVis.find((v) => v.name === storedVisName) || lastVis;
  if (activeVis.name !== storedVisName) {
    setStoredVisName(lastVis.name);
  }

  return [activeVis, (v: T) => setStoredVisName(v.name)];
}
