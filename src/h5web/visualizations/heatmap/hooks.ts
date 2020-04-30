import { CSSProperties, useContext, useMemo, useEffect } from 'react';
import { useComlink } from 'react-use-comlink';
import { useMeasure, useSetState } from 'react-use';
import shallow from 'zustand/shallow';
import { useHeatmapConfig } from './config';
import { HeatmapProps, HeatmapContext } from './HeatmapProvider';
import { D3Interpolator } from './models';
import { INTERPOLATORS } from './interpolators';
import { TextureWorker } from './worker';

// eslint-disable-next-line
// @ts-ignore
import Worker from 'worker-loader!./worker'; // eslint-disable-line

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

    (async () => {
      mergeState({ loading: true }); // keep existing texture data, if any
      mergeState({
        loading: false,
        textureData: await proxy.computeTextureData(
          values,
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

export function useHeatmapStyles<T>(): [
  (elem: T) => void,
  CSSProperties | undefined
] {
  const { dims, axisOffsets } = useProps();
  const [leftAxisWidth, bottomAxisHeight] = axisOffsets;

  const keepAspectRatio = useHeatmapConfig(state => state.keepAspectRatio);
  const [wrapperRef, { width, height }] = useMeasure();

  if (width === 0 && height === 0) {
    return [wrapperRef, undefined];
  }

  if (!keepAspectRatio) {
    return [
      wrapperRef,
      {
        width,
        height,
        paddingBottom: bottomAxisHeight,
        paddingLeft: leftAxisWidth,
      },
    ];
  }

  const [rows, cols] = dims;
  const aspectRatio = rows / cols;

  const availableWidth = width - leftAxisWidth;
  const availableHeight = height - bottomAxisHeight;

  // Determine how to compute canvas size to fit available space while maintaining aspect ratio
  const shouldAdjustWidth = availableWidth >= availableHeight * aspectRatio;

  const canvasWidth = shouldAdjustWidth
    ? availableHeight * aspectRatio
    : availableWidth;
  const canvasHeight = shouldAdjustWidth
    ? availableHeight
    : availableWidth / aspectRatio;

  return [
    wrapperRef,
    {
      boxSizing: 'content-box',
      width: canvasWidth,
      height: canvasHeight,
      paddingBottom: bottomAxisHeight,
      paddingLeft: leftAxisWidth,
    },
  ];
}
