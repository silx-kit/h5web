import { useEffect } from 'react';
import { transfer } from 'comlink';
import { useComlink } from 'react-use-comlink';
import { useSetState } from 'react-use';
import shallow from 'zustand/shallow';

// @ts-ignore
import Worker from 'worker-loader!./worker';

import { useHeatmapConfig } from './config';
import type { D3Interpolator } from './models';
import { INTERPOLATORS } from './interpolators';
import type { TextureWorker } from './worker';

export function useInterpolator(): D3Interpolator {
  const colorMap = useHeatmapConfig((state) => state.colorMap);
  return INTERPOLATORS[colorMap];
}

export interface TextureDataState {
  loading?: boolean;
  textureData?: Uint8Array;
  prevDims?: string;
}

export function useTextureData(
  rows: number,
  cols: number,
  values: number[]
): TextureDataState {
  const [dataDomain, customDomain, scaleType, colorMap] = useHeatmapConfig(
    (state) => [
      state.dataDomain,
      state.customDomain,
      state.scaleType,
      state.colorMap,
    ],
    shallow
  );

  const domain = customDomain || dataDomain;

  const { proxy } = useComlink<TextureWorker>(() => new Worker(), []);
  const [state, mergeState] = useSetState<TextureDataState>({});

  /*
   * Dependencies that trigger a recomputation of the texture.
   * > Note that `values` is purposely not included. When `values` changes, a first render
   * > is triggered, during which `dataDomain` has not yet been recomputed. We must wait for
   * > `domain` to be updated before recomputing the texture.
   */
  const deps = [colorMap, domain, scaleType, proxy, mergeState];

  useEffect(() => {
    if (!domain) {
      return;
    }

    // Keep existing texture data, if any
    mergeState({ loading: true });

    // Prepare transferable buffer to avoid cloning values array
    const typedValues = Float64Array.from(values);

    (async () => {
      mergeState({
        loading: false,
        textureData: await proxy.computeTextureData(
          transfer(typedValues, [typedValues.buffer]),
          domain,
          scaleType,
          colorMap
        ),
      });
    })();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset texture when dimensions change to avoid rendering glitch while computing new texture
  const dims = `${rows}x${cols}`;
  if (dims !== state.prevDims) {
    mergeState({ textureData: undefined, prevDims: dims });
  }

  return state;
}
