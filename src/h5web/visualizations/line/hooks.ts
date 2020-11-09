import { useContext, useMemo } from 'react';
import { useThree } from 'react-three-fiber';
import { BufferGeometry, Vector3 } from 'three';
import AxisSystemContext from '../shared/AxisSystemContext';
import { getCanvasScale } from '../shared/utils';

export function useDataGeometry(
  abscissas: number[],
  ordinates: number[]
): BufferGeometry {
  const { abscissaConfig, ordinateConfig } = useContext(AxisSystemContext);
  const { camera, size } = useThree();
  const { width, height } = size;

  return useMemo(() => {
    const abscissaScale = getCanvasScale(abscissaConfig, width);
    const ordinateScale = getCanvasScale(ordinateConfig, height);

    const points = ordinates.map((val, index) => {
      const ordinate = ordinateScale(val);
      return new Vector3(
        abscissaScale(abscissas[index]),
        // This is to avoid a three.js warning when ordinateScale(val) is Infinity
        Number.isFinite(ordinate) ? ordinate : 0,
        // Move NaN/Infinity out of the camera FOV (negative val for logScale).
        // This allows to have only curve segments for the positive values
        Number.isFinite(ordinate) ? 0 : camera.far
      );
    });

    const geometry = new BufferGeometry();
    geometry.setFromPoints(points);
    return geometry;
  }, [
    abscissaConfig,
    abscissas,
    camera,
    height,
    ordinateConfig,
    ordinates,
    width,
  ]);
}
