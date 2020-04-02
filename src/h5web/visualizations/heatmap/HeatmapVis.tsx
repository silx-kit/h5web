import React, { useMemo } from 'react';
import { Canvas } from 'react-three-fiber';
import Mesh from './Mesh';
import { computeTextureData } from './utils';

interface Props {
  dims: [number, number];
  data: number[][];
}

function HeatmapVis(props: Props): JSX.Element {
  const { dims, data } = props;
  const textureData = useMemo(() => computeTextureData(data), [data]);

  return (
    <Canvas orthographic>
      <ambientLight />
      {textureData && <Mesh dims={dims} textureData={textureData} />}
    </Canvas>
  );
}

export default React.memo(HeatmapVis);
