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
  const [dataDomain, customDomain, hasLogScale, colorMap] = useHeatmapConfig(
    (state) => [
      state.dataDomain,
      state.customDomain,
      state.hasLogScale,
      state.colorMap,
    ],
    shallow
  );

  const domain = customDomain || dataDomain;

  const { proxy } = useComlink<TextureWorker>(() => new Worker(), []);
  const [state, mergeState] = useSetState<TextureDataState>({});

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
          hasLogScale,
          colorMap
        ),
      });
    })();
  }, [colorMap, domain, hasLogScale, proxy, mergeState, values]);

  // Reset texture when dimensions change to avoid rendering glitch while computing new texture
  const dims = `${rows}x${cols}`;
  if (dims !== state.prevDims) {
    mergeState({ textureData: undefined, prevDims: dims });
  }

  return state;
}
