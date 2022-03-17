import type { NumArray } from '@h5web/shared';
import { getDims } from '@h5web/shared';
import type { NdArray } from 'ndarray';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import Pan from '../../interactions/Pan';
import ResetZoomButton from '../../interactions/ResetZoomButton';
import SelectToZoom from '../../interactions/SelectToZoom';
import XAxisZoom from '../../interactions/XAxisZoom';
import YAxisZoom from '../../interactions/YAxisZoom';
import Zoom from '../../interactions/Zoom';
import styles from '../heatmap/HeatmapVis.module.css';
import type { Layout } from '../heatmap/models';
import VisCanvas from '../shared/VisCanvas';
import { DEFAULT_INTERACTIONS_KEYS } from '../utils';
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

  const keepRatio = layout !== 'fill';

  return (
    <figure className={styles.root} aria-label={title} data-keep-canvas-colors>
      <VisCanvas
        title={title}
        canvasRatio={layout === 'contain' ? cols / rows : undefined}
        visRatio={keepRatio ? cols / rows : undefined}
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
        interactionKeys={DEFAULT_INTERACTIONS_KEYS}
      >
        <Pan />
        <Zoom />
        <XAxisZoom disabled={keepRatio} />
        <YAxisZoom disabled={keepRatio} />
        <SelectToZoom keepRatio={keepRatio} />
        <ResetZoomButton />
        <RgbMesh values={safeDataArray} bgr={imageType === ImageType.BGR} />
        {children}
      </VisCanvas>
    </figure>
  );
}

export default RgbVis;
