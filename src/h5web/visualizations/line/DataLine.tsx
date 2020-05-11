import React from 'react';
import { useUpdate } from 'react-three-fiber';
import { BufferGeometry } from 'three';
import { useDataPoints } from './hooks';

function DataLine(): JSX.Element {
  const points = useDataPoints();
  const ref = useUpdate(
    (geometry: BufferGeometry) => {
      if (points) {
        geometry.setFromPoints(points);
      }
    },
    [points]
  );

  return (
    <line>
      <bufferGeometry attach="geometry" ref={ref} />
      <lineBasicMaterial attach="material" color="#1b998b" linewidth={2} />
    </line>
  );
}

export default DataLine;
