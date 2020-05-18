import React from 'react';
import { useUpdate } from 'react-three-fiber';
import { BufferGeometry } from 'three';
import { useDataPoints } from './hooks';
import { useLineConfig } from './config';
import { Glyph } from './models';

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

  if (glyph === Glyph.Line) {
    return (
      <line>
        <bufferGeometry attach="geometry" ref={ref} />
        <lineBasicMaterial attach="material" color={color} linewidth={2} />
      </line>
    );
  }

  if (glyph === Glyph.Square) {
    return (
      <points>
        <bufferGeometry attach="geometry" ref={ref} />
        <pointsMaterial attach="material" color={color} size={5} />
      </points>
    );
  }

  return <></>;
}

export default DataCurve;
