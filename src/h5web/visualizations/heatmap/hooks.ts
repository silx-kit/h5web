import { useMemo, useEffect } from 'react';
import { transfer } from 'comlink';
import { useComlink } from 'react-use-comlink';
import { useSetState } from 'react-use';
import shallow from 'zustand/shallow';

// @ts-ignore
import Worker from 'worker-loader!./worker';

import { useHeatmapConfig } from './config';
import type { D3Interpolator, Dims } from './models';
import { INTERPOLATORS } from './interpolators';
import type { TextureWorker } from './worker';
import { useVisProps } from '../../dataset-visualizer/VisProvider';

export function useData(): number[][] {
  const { values } = useVisProps();

  return values;
}

export function useDims(): Dims {
  const { rawDims } = useVisProps();

  if (rawDims.length === 2) {
    return rawDims as Dims;
  }

  throw new Error('Data not supported by HeatmapVis');
}

export function useValues(): number[] {
  const data = useData();
  return useMemo(() => data.flat(), [data]);
}

export function useInterpolator(): D3Interpolator {
  const colorMap = useHeatmapConfig((state) => state.colorMap);
  return INTERPOLATORS[colorMap];
}

export interface TextureDataState {
  loading?: boolean;
  textureData?: Uint8Array;
}

export function useTextureData(): TextureDataState {
  const [dataDomain, customDomain, hasLogScale, colorMap] = useHeatmapConfig(
    (state) => [
      state.dataDomain,
      state.customDomain,
      state.hasLogScale,
      state.colorMap,
    ],
    shallow
  );

  const values = useValues();
  const { proxy } = useComlink<TextureWorker>(() => new Worker(), []);

  const [state, mergeState] = useSetState<TextureDataState>({});

  useEffect(() => {
    if (!dataDomain) {
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
          customDomain || dataDomain,
          hasLogScale,
          colorMap
        ),
      });
    })();
  }, [
    colorMap,
    customDomain,
    dataDomain,
    hasLogScale,
    proxy,
    mergeState,
    values,
  ]);

  return state;
}
