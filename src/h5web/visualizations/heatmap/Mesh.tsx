import React, { useMemo, ReactElement } from 'react';
import { useThree } from 'react-three-fiber';
import { RGBFormat, MeshBasicMaterial, DataTexture } from 'three';
import { HTML } from 'drei';
import { useTextureData, useDims } from './hooks';
import styles from './HeatmapVis.module.css';

function Mesh(): ReactElement {
  const dims = useDims();

  const { size } = useThree();
  const { width, height } = size;

  const { textureData, loading } = useTextureData();
  const material = useMemo(() => {
    return (
      textureData &&
      new MeshBasicMaterial({
        map: new DataTexture(textureData, dims[1], dims[0], RGBFormat),
      })
    );
  }, [dims, textureData]);

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
