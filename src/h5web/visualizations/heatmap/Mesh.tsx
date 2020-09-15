import React, { useMemo, ReactElement } from 'react';
import { useThree } from 'react-three-fiber';
import { RGBFormat, MeshBasicMaterial, DataTexture } from 'three';
import { HTML } from 'drei';
import { useTextureData } from './hooks';
import styles from './HeatmapVis.module.css';
import type { Domain, ScaleType } from '../shared/models';
import type { ColorMap } from './models';

interface Props {
  rows: number;
  cols: number;
  values: number[];
  domain: Domain | undefined;
  scaleType: ScaleType;
  colorMap: ColorMap;
}

function Mesh(props: Props): ReactElement {
  const { rows, cols, values, domain, scaleType, colorMap } = props;

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
          <planeBufferGeometry attach="geometry" args={[width, height]} />
        </mesh>
      )}
      <HTML>
        <div
          className={styles.textureLoader}
          style={{ width, height }}
          data-visible={loading || undefined}
        />
      </HTML>
    </>
  );
}

export default Mesh;
