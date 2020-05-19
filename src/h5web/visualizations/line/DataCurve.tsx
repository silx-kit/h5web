import React, { Suspense } from 'react';
import { useUpdate } from 'react-three-fiber';
import { BufferGeometry } from 'three';
import { useDataPoints } from './hooks';
import { useLineConfig } from './config';
import { Glyph } from './models';
import DataCurveMaterial from './DataCurveMaterial';

function DataCurve(): JSX.Element {
  const points = useDataPoints();
  const ref = useUpdate(
    (geometry: BufferGeometry) => {
      if (points) {
        geometry.setFromPoints(points);
      }
    },
    [points]
  );
  const glyph = useLineConfig(state => state.glyph);
  const color = '#1b998b';

  // No glyph -> display as line
  if (glyph === Glyph.None) {
    return (
      <line>
        <bufferGeometry attach="geometry" ref={ref} />
        <lineBasicMaterial attach="material" color={color} linewidth={2} />
      </line>
    );
  }

  return (
    <Suspense fallback={<></>}>
      <points>
        <bufferGeometry attach="geometry" ref={ref} />
        <DataCurveMaterial glyph={glyph} color={color} />
      </points>
    </Suspense>
  );
}

export default DataCurve;
