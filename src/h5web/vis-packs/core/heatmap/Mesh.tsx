import { useMemo, ReactElement } from 'react';
import { useThree } from 'react-three-fiber';
import { RGBFormat, MeshBasicMaterial, DataTexture } from 'three';
import Html from '../shared/Html';
import { useTextureData } from './hooks';
import styles from './HeatmapVis.module.css';
import type { Domain, ScaleType } from '../models';
import type { ColorMap } from './models';

interface Props {
  rows: number;
  cols: number;
  values: number[];
  domain: Domain;
  scaleType: ScaleType;
  colorMap: ColorMap;
  showLoader: boolean;
}

function Mesh(props: Props): ReactElement {
  const { rows, cols, values, domain, scaleType, colorMap, showLoader } = props;

  const { size } = useThree();
  const { width, height } = size;

  const { textureData, loading } = useTextureData(
    rows,
    cols,
    values,
    domain,
    scaleType,
    colorMap
  );

  const material = useMemo(() => {
    return (
      textureData &&
      new MeshBasicMaterial({
        map: new DataTexture(textureData, cols, rows, RGBFormat),
      })
    );
  }, [cols, rows, textureData]);

  return (
    <>
      {material && (
        <mesh material={material}>
          <planeGeometry attach="geometry" args={[width, height]} />
        </mesh>
      )}
      {showLoader && (
        <Html
          className={styles.textureLoader}
          data-visible={loading || undefined}
        />
      )}
    </>
  );
}

export default Mesh;
