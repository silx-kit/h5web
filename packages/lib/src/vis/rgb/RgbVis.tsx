import { assertDefined, getDims, type NumArray } from '@h5web/shared';
import { type NdArray } from 'ndarray';
import { type ReactNode, useMemo } from 'react';

import DefaultInteractions, {
  type DefaultInteractionsConfig,
} from '../../interactions/DefaultInteractions';
import ResetZoomButton from '../../toolbar/floating/ResetZoomButton';
import styles from '../heatmap/HeatmapVis.module.css';
import { usePixelEdgeValues } from '../heatmap/hooks';
import { useAxisDomain } from '../hooks';
import { type Aspect, type AxisParams } from '../models';
import VisCanvas from '../shared/VisCanvas';
import { ImageType } from './models';
import RgbMesh from './RgbMesh';
import { toRgbSafeNdArray } from './utils';

interface Props {
  dataArray: NdArray<NumArray>;
  aspect?: Aspect;
  showGrid?: boolean;
  title?: string;
  imageType?: ImageType;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
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
    children,
    interactions,
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
    <figure className={styles.root} aria-label={title} data-keep-canvas-colors>
      <VisCanvas
        title={title}
        aspect={aspect}
        abscissaConfig={{
          visDomain: abscissaDomain,
          showGrid,
          isIndexAxis: true,
          label: abscissaLabel,
        }}
        ordinateConfig={{
          visDomain: ordinateDomain,
          showGrid,
          isIndexAxis: true,
          flip: true,
          label: ordinateLabel,
        }}
      >
        <DefaultInteractions {...interactions} />
        <ResetZoomButton />

        <RgbMesh values={safeDataArray} bgr={imageType === ImageType.BGR} />

        {children}
      </VisCanvas>
    </figure>
  );
}

export default RgbVis;
