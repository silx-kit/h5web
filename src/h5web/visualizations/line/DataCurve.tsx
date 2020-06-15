import React, { Suspense, useMemo, useContext } from 'react';
import { BufferGeometry, Vector3 } from 'three';
import { Line } from 'react-three-fiber/components';
import { useThree } from 'react-three-fiber';
import { useLineConfig } from './config';
import { CurveType } from './models';
import DataGlyphs from './DataGlyphs';
import { AxisSystemContext } from '../shared/AxisSystemProvider';
import { getAxisScale } from '../shared/utils';

const DEFAULT_COLOR = '#1b998b';

interface Props {
  values: number[];
  color?: string;
}

function DataCurve(props: Props): JSX.Element {
  const { values, color = DEFAULT_COLOR } = props;

  const { abscissaInfo, ordinateInfo } = useContext(AxisSystemContext);
  const { size } = useThree();
  const { width, height } = size;

  const dataGeometry = useMemo(() => {
    const abscissaScale = getAxisScale(abscissaInfo, width);
    const ordinateScale = getAxisScale(ordinateInfo, height);

    const points = values.map(
      (val, index) => new Vector3(abscissaScale(index), ordinateScale(val), 0)
    );

    const geometry = new BufferGeometry();
    geometry.setFromPoints(points);
    return geometry;
  }, [abscissaInfo, height, ordinateInfo, values, width]);

  const curveType = useLineConfig((state) => state.curveType);
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
