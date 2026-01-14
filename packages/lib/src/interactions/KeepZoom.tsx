import { useDebouncedCallback, useSyncedRef } from '@react-hookz/web';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { useStore } from 'zustand';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import { useMoveCameraTo } from './hooks';
import { useKeepZoomStore } from './keep-zoom-store';

interface Props {
  visKey: string;
  xOnly?: boolean;
}

function KeepZoom(props: Props) {
  const { visKey, xOnly = false } = props;

  const store = useKeepZoomStore();
  const setState = useStore(store, (state) => state.setState);
  const setStateDebounced = useDebouncedCallback(setState, [setState], 100);
  const unset = useStore(store, (state) => state.unset);

  const camera = useThree((state) => state.camera);
  const moveCameraToRef = useSyncedRef(useMoveCameraTo());

  const { abscissaConfig, ordinateConfig } = useVisCanvasContext();
  const visContextKeyRef = useSyncedRef(
    // When `xOnly` is true, only include abscissa domain in key
    `${abscissaConfig.visDomain.toString()}${xOnly ? '' : `_${ordinateConfig.visDomain.toString()}`}`,
  );

  /* Restore camera position and scale on mount if current key matches persisted key from store.
   * Synced refs are to ensure that the effect runs only on mount and not when the axis domains change. */
  useLayoutEffect(() => {
    const state = store.getState().states.get(visKey); // non-reactive state to avoid render loop

    if (state && state.visContextKey === visContextKeyRef.current) {
      camera.scale.copy(state.scale);
      moveCameraToRef.current(state.position);
    }
  }, [visKey, visContextKeyRef, moveCameraToRef, camera, store]);

  // Save camera position and scale on change
  useFrame(() => {
    // With `XOnly`, don't save if user has zoomed on `y` (and unset any previously saved state)
    if (xOnly && camera.scale.y < 1) {
      unset(visKey);
      return;
    }

    setStateDebounced(
      visKey,
      visContextKeyRef.current,
      camera.position,
      camera.scale,
    );
  });

  return null;
}

export default KeepZoom;
