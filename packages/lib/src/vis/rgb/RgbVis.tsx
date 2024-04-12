import { assertDefined } from '@h5web/shared/guards';
import type { NumArray } from '@h5web/shared/vis-models';
import { getDims } from '@h5web/shared/vis-utils';
import type { NdArray } from 'ndarray';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import type { DefaultInteractionsConfig } from '../../interactions/DefaultInteractions';
import DefaultInteractions from '../../interactions/DefaultInteractions';
import ResetZoomButton from '../../toolbar/floating/ResetZoomButton';
import styles from '../heatmap/HeatmapVis.module.css';
import { usePixelEdgeValues } from '../heatmap/hooks';
import { useAxisDomain } from '../hooks';
import type { Aspect, AxisParams, ClassStyleAttrs } from '../models';
import VisCanvas from '../shared/VisCanvas';
import { ImageType } from './models';
import RgbMesh from './RgbMesh';
import { toRgbSafeNdArray } from './utils';

interface Props extends ClassStyleAttrs {
  dataArray: NdArray<NumArray>;
  aspect?: Aspect;
  showGrid?: boolean;
  title?: string;
  imageType?: ImageType;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
  flipXAxis?: boolean;
  flipYAxis?: boolean;
  children?: ReactNode;
  interactions?: DefaultInteractionsConfig;
}

function RgbVis(props: Props) {
  const {
    dataArray,
    aspect = 'equal',
    showGrid = false,
    title,
    imageType = ImageType.RGB,
    abscissaParams = {},
    ordinateParams = {},
    flipXAxis,
    flipYAxis,
    children,
    interactions,
    className = '',
    style,
  } = props;

  const { label: abscissaLabel, value: abscissaValue } = abscissaParams;
  const { label: ordinateLabel, value: ordinateValue } = ordinateParams;
  const { rows, cols } = getDims(dataArray);

  const abscissas = usePixelEdgeValues(abscissaValue, cols);
  const abscissaDomain = useAxisDomain(abscissas);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const ordinates = usePixelEdgeValues(ordinateValue, rows);
  const ordinateDomain = useAxisDomain(ordinates);
  assertDefined(ordinateDomain, 'Ordinates have undefined domain');

  const safeDataArray = useMemo(() => toRgbSafeNdArray(dataArray), [dataArray]);

  return (
    <figure
      className={`${styles.root} ${className}`}
      style={style}
      aria-label={title}
      data-keep-canvas-colors
    >
      <VisCanvas
        title={title}
        aspect={aspect}
        abscissaConfig={{
          visDomain: abscissaDomain,
          showGrid,
          isIndexAxis: true,
          label: abscissaLabel,
          flip: flipXAxis,
        }}
        ordinateConfig={{
          visDomain: ordinateDomain,
          showGrid,
          isIndexAxis: true,
          flip: flipYAxis,
          label: ordinateLabel,
        }}
      >
        <DefaultInteractions {...interactions} />
        <ResetZoomButton />

        <RgbMesh
          values={safeDataArray}
          bgr={imageType === ImageType.BGR}
          scale={[flipXAxis ? -1 : 1, flipYAxis ? -1 : 1, 1]}
        />

        {children}
      </VisCanvas>
    </figure>
  );
}

export default RgbVis;
