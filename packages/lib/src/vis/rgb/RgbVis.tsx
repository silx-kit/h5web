import { toTextureSafeNdArray } from '@h5web/shared';
import type { NdArray, TypedArray } from 'ndarray';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { DataTexture, FloatType, RGBFormat } from 'three';

import styles from '../heatmap/HeatmapVis.module.css';
import type { Layout } from '../heatmap/models';
import { getDims } from '../heatmap/utils';
import PanMesh from '../shared/PanMesh';
import VisCanvas from '../shared/VisCanvas';
import VisMesh from '../shared/VisMesh';
import ZoomMesh from '../shared/ZoomMesh';
import { ImageType } from './models';
import { flipLastDimension } from './utils';

interface Props {
  dataArray: NdArray<number[] | TypedArray>;
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

  const values = useMemo(() => {
    const typedDataArray = toTextureSafeNdArray(dataArray);
    return imageType === ImageType.BGR
      ? flipLastDimension(typedDataArray)
      : typedDataArray;
  }, [dataArray, imageType]);

  const { rows, cols } = getDims(dataArray);

  const texture = useMemo(
    () => new DataTexture(values.data, cols, rows, RGBFormat, FloatType),
    [cols, rows, values]
  );

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
