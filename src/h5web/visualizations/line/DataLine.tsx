import React, { useCallback } from 'react';
import { useDataPoints } from './hooks';

function DataLine(): JSX.Element {
  const points = useDataPoints();
  const setFromPoints = useCallback(self => self.setFromPoints(points), [
    points,
  ]);

  return (
    <line>
      {points && <bufferGeometry attach="geometry" onUpdate={setFromPoints} />}
      <lineBasicMaterial attach="material" color="#1b998b" linewidth={2} />
    </line>
  );
}

export default DataLine;
