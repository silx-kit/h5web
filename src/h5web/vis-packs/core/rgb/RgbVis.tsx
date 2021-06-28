import { ReactNode, useMemo } from 'react';
import styles from '../heatmap/HeatmapVis.module.css';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import type { Layout } from '../heatmap/models';
import { DataTexture, RGBFormat, UnsignedByteType } from 'three';
import VisMesh from '../shared/VisMesh';

interface Props {
  value: number[];
  dims: number[];
  layout?: Layout;
  showGrid?: boolean;
  title?: string;
  children?: ReactNode;
}

function RgbVis(props: Props) {
  const {
    value,
    dims,
    layout = 'cover',
    showGrid = false,
    title,
    children,
  } = props;

  const [rows, cols] = dims;

  const texture = useMemo(() => {
    return new DataTexture(
      Uint8Array.from(value),
      cols,
      rows,
      RGBFormat,
      UnsignedByteType
    );
  }, [cols, rows, value]);

  return (
    <figure
      className={styles.root}
      aria-labelledby="vis-title"
      data-keep-canvas-colors
    >
      <VisCanvas
        title={title}
        aspectRatio={layout === 'contain' ? cols / rows : undefined}
        visRatio={layout === 'cover' ? cols / rows : undefined}
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
        <PanZoomMesh />
        <VisMesh scale={[1, -1, 1]}>
          <meshBasicMaterial map={texture} />
        </VisMesh>
        {children}
      </VisCanvas>
    </figure>
  );
}

export type { Props as RgbVisProps };
export default RgbVis;
