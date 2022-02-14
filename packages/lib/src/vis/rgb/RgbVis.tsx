import type { NumArray } from '@h5web/shared';
import type { NdArray } from 'ndarray';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { DataTexture, FloatType, RGBFormat, UnsignedByteType } from 'three';

import styles from '../heatmap/HeatmapVis.module.css';
import type { Layout } from '../heatmap/models';
import { getDims } from '../heatmap/utils';
import PanMesh from '../shared/PanMesh';
import VisCanvas from '../shared/VisCanvas';
import VisMesh from '../shared/VisMesh';
import ZoomMesh from '../shared/ZoomMesh';
import { ImageType } from './models';
import { flipLastDimension, toRgbSafeNdArray } from './utils';

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

  const texture = useMemo(() => {
    const typedDataArray = toRgbSafeNdArray(dataArray);

    const flippedDataArray =
      imageType === ImageType.BGR
        ? flipLastDimension(typedDataArray)
        : typedDataArray;

    return new DataTexture(
      flippedDataArray.data,
      cols,
      rows,
      RGBFormat,
      flippedDataArray.dtype === 'float32' ? FloatType : UnsignedByteType
    );
  }, [dataArray, imageType, cols, rows]);

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
        <PanMesh />
        <ZoomMesh />
        <VisMesh scale={[1, -1, 1]}>
          <meshBasicMaterial map={texture} />
        </VisMesh>
        {children}
      </VisCanvas>
    </figure>
  );
}

export default RgbVis;
