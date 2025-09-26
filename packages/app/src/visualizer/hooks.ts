import { useLocalStorageValue } from '@react-hookz/web';
import { useState } from 'react';

import { type VisDef } from '../vis-packs/models';

export function useActiveVis(
  supportedVis: VisDef[],
  primaryVis: VisDef | undefined,
): [VisDef, (index: number) => void] {
  const {
    value: preferredVisName,
    set: savePreferredVisName,
    remove: removePreferredVisName,
  } = useLocalStorageValue<string>('h5web:preferredVis');

  const preferredVis = preferredVisName
    ? supportedVis.find((v) => v.name === preferredVisName)
    : undefined;

  const lastSupportedIndex = supportedVis.length - 1;
  const lastVis = supportedVis[lastSupportedIndex];

  const state = useState(primaryVis || preferredVis || lastVis); // reset when selecting a new entity (cf. `key` on `VisManager`)
  const [activeVis, setActiveVis] = state;

  return [
    activeVis,
    (index: number) => {
      const vis = supportedVis[index];

      if (index < lastSupportedIndex) {
        // When user explicitly selects another vis than the last, save it as the preferred vis in local storage
        savePreferredVisName(vis.name);
      } else if (index === lastSupportedIndex && preferredVisName) {
        // When user selects last vis again, remove preferred vis from local storage
        removePreferredVisName();
      }

      setActiveVis(vis);
    },
  ];
}
