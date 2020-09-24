import { useEffect } from 'react';
import { transfer } from 'comlink';
import { useComlink } from 'react-use-comlink';
import { useSetState, createMemo } from 'react-use';

// @ts-ignore
import Worker from 'worker-loader?inline=no-fallback!./heatmap.worker';

import type { TextureWorker } from './heatmap.worker';
import type { Domain, ScaleType } from '../shared/models';
import type { ColorMap } from './models';
import { getSupportedDomain } from './utils';

export interface TextureDataState {
  loading?: boolean;
  textureData?: Uint8Array;
  prevDims?: string;
}

export function useTextureData(
  rows: number,
  cols: number,
  values: number[],
  domain: Domain,
  scaleType: ScaleType,
  colorMap: ColorMap
): TextureDataState {
  const { proxy } = useComlink<TextureWorker>(() => new Worker(), []);
  const [state, mergeState] = useSetState<TextureDataState>({});

  useEffect(() => {
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
  }, [colorMap, domain, scaleType, proxy, mergeState, values]);

  // Reset texture when dimensions change to avoid rendering glitch while computing new texture
  const dims = `${rows}x${cols}`;
  if (dims !== state.prevDims) {
    mergeState({ textureData: undefined, prevDims: dims });
  }

  return state;
}

export const useSupportedDomain = createMemo(getSupportedDomain);
