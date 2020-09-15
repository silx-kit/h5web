import { useEffect } from 'react';
import { transfer } from 'comlink';
import { useComlink } from 'react-use-comlink';
import { useSetState, createMemo } from 'react-use';

// @ts-ignore
import Worker from 'worker-loader!./worker';

import type { TextureWorker } from './worker';
import type { Domain, ScaleType } from '../shared/models';
import type { ColorMap } from './models';
import { getColorScaleDomain } from './utils';

export interface TextureDataState {
  loading?: boolean;
  textureData?: Uint8Array;
  prevDims?: string;
}

export function useTextureData(
  rows: number,
  cols: number,
  values: number[],
  domain: Domain | undefined,
  scaleType: ScaleType,
  colorMap: ColorMap
): TextureDataState {
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

export const useMemoColorScaleDomain = createMemo(getColorScaleDomain);
