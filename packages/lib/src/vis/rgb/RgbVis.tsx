import type { NumArray } from '@h5web/shared';
import { getDims } from '@h5web/shared';
import type { NdArray } from 'ndarray';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import styles from '../heatmap/HeatmapVis.module.css';
import type { Layout } from '../heatmap/models';
import PanEvents from '../shared/PanEvents';
import ResetZoomButton from '../shared/ResetZoomButton';
import VisCanvas from '../shared/VisCanvas';
import ZoomEvents from '../shared/ZoomEvents';
import ZoomSelectionEvents from '../shared/ZoomSelectionEvents';
import RgbMesh from './RgbMesh';
import { ImageType } from './models';
import { toRgbSafeNdArray } from './utils';

interface Props {
  dataArray: NdArray<NumArray>;
  layout?: Layout;
  showGrid?: boolean;
  title?: string;
  imageType?: ImageType;
  children?: ReactNode;
}

function RgbVis(props: Props) {
  const {
    dataArray,
    layout = 'cover',
    showGrid = false,
    title,
    imageType = ImageType.RGB,
    children,
  } = props;

  const { rows, cols } = getDims(dataArray);
  const safeDataArray = useMemo(() => toRgbSafeNdArray(dataArray), [dataArray]);

  return (
    <figure className={styles.root} aria-label={title} data-keep-canvas-colors>
      <VisCanvas
        title={title}
        canvasRatio={layout === 'contain' ? cols / rows : undefined}
        visRatio={layout !== 'fill' ? cols / rows : undefined}
        abscissaConfig={{
          visDomain: [0, cols],
          showGrid,
          isIndexAxis: true,
        }}
        ordinateConfig={{
          visDomain: [0, rows],
          showGrid,
          isIndexAxis: true,
          flip: true,
        }}
      >
        <PanEvents />
        <ZoomEvents />
        <ZoomSelectionEvents />
        <ResetZoomButton />
        <RgbMesh values={safeDataArray} bgr={imageType === ImageType.BGR} />
        {children}
      </VisCanvas>
    </figure>
  );
}

export default RgbVis;
