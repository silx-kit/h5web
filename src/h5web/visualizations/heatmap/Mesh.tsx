import React, { useMemo, ReactElement } from 'react';
import { useThree } from 'react-three-fiber';
import { RGBFormat, MeshBasicMaterial, DataTexture } from 'three';
import { HTML } from 'drei';
import { useTextureData } from './hooks';
import styles from './HeatmapVis.module.css';

interface Props {
  rows: number;
  cols: number;
  values: number[];
}

function Mesh(props: Props): ReactElement {
  const { rows, cols, values } = props;

  const { size } = useThree();
  const { width, height } = size;

  const { textureData, loading } = useTextureData(rows, cols, values);

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
