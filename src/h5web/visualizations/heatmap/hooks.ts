import { useContext, useMemo, useEffect } from 'react';
import { transfer } from 'comlink';
import { useComlink } from 'react-use-comlink';
import { useSetState } from 'react-use';
import shallow from 'zustand/shallow';

// @ts-ignore
import Worker from 'worker-loader!./worker';

import { useHeatmapConfig } from './config';
import { HeatmapProps, HeatmapContext } from './HeatmapProvider';
import { D3Interpolator } from './models';
import { INTERPOLATORS } from './interpolators';
import { TextureWorker } from './worker';

export function useProps(): HeatmapProps {
  const props = useContext(HeatmapContext);

  if (!props) {
    throw new Error('Missing Heatmap provider.');
  }

  return props;
}

export function useValues(): number[] {
  const { data } = useProps();
  return useMemo(() => data.flat(), [data]);
}

export function useInterpolator(): D3Interpolator {
  const colorMap = useHeatmapConfig(state => state.colorMap);
  return INTERPOLATORS[colorMap];
}

export interface TextureDataState {
  loading?: boolean;
  textureData?: Uint8Array;
}

export function useTextureData(): TextureDataState {
  const [dataDomain, customDomain, hasLogScale, colorMap] = useHeatmapConfig(
    state => [
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
