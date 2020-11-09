import React, { Suspense, ReactElement } from 'react';
import { Line } from 'react-three-fiber/components';
import { CurveType } from './models';
import DataGlyphs from './DataGlyphs';
import { useDataGeometry } from './hooks';

const DEFAULT_COLOR = '#1b998b';

interface Props {
  abscissas: number[];
  ordinates: number[];
  color?: string;
  curveType?: CurveType;
}

function DataCurve(props: Props): ReactElement {
  const {
    abscissas,
    ordinates,
    color = DEFAULT_COLOR,
    curveType = CurveType.LineOnly,
  } = props;

  const dataGeometry = useDataGeometry(abscissas, ordinates);

  const showLine = curveType !== CurveType.GlyphsOnly;
  const showGlyphs = curveType !== CurveType.LineOnly;

  return (
    <Suspense fallback={<></>}>
      {showGlyphs && <DataGlyphs geometry={dataGeometry} color={color} />}
      {showLine && (
        <Line geometry={dataGeometry}>
          <lineBasicMaterial attach="material" color={color} linewidth={2} />
        </Line>
      )}
    </Suspense>
  );
}

export default DataCurve;
