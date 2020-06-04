import React, { Suspense, useMemo } from 'react';
import { BufferGeometry } from 'three';
import { Line } from 'react-three-fiber/components';
import { useDataPoints } from './hooks';
import { useLineConfig } from './config';
import { CurveType } from './models';
import DataGlyphs from './DataGlyphs';

const COLOR = '#1b998b';

function DataCurve(): JSX.Element {
  const points = useDataPoints();
  const dataGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    if (points) {
      geometry.setFromPoints(points);
    }
    return geometry;
  }, [points]);

  const curveType = useLineConfig((state) => state.curveType);
  const showLine = curveType !== CurveType.GlyphsOnly;
  const showGlyphs = curveType !== CurveType.LineOnly;

  return (
    <Suspense fallback={<></>}>
      {showGlyphs && <DataGlyphs geometry={dataGeometry} color={COLOR} />}
      {showLine && (
        <Line geometry={dataGeometry}>
          <lineBasicMaterial attach="material" color={COLOR} linewidth={2} />
        </Line>
      )}
    </Suspense>
  );
}

export default DataCurve;
