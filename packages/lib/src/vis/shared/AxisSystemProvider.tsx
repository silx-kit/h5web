import { useThree } from '@react-three/fiber';
import type { PropsWithChildren } from 'react';
import type { Vector3 } from 'three';
import { Vector2 } from 'three';

import type { AxisConfig } from '../models';
import { getSizeToFit, getCanvasScale } from '../utils';
import { AxisSystemContext } from './AxisSystemContext';

interface Props {
  visRatio: number | undefined;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
}

function AxisSystemProvider(props: PropsWithChildren<Props>) {
  const { visRatio, abscissaConfig, ordinateConfig, children } = props;

  const availableSize = useThree((state) => state.size);
  const visSize = getSizeToFit(availableSize, visRatio);

  const abscissaScale = getCanvasScale(abscissaConfig, visSize.width);
  const ordinateScale = getCanvasScale(ordinateConfig, visSize.height);

  const worldToData = (vec: Vector2 | Vector3) =>
    new Vector2(abscissaScale.invert(vec.x), ordinateScale.invert(vec.y));
  const dataToWorld = (vec: Vector2 | Vector3) =>
    new Vector2(abscissaScale(vec.x), ordinateScale(vec.y));

  return (
    <AxisSystemContext.Provider
      value={{
        abscissaConfig,
        ordinateConfig,
        abscissaScale,
        ordinateScale,
        worldToData,
        dataToWorld,
        visSize,
      }}
    >
      {children}
    </AxisSystemContext.Provider>
  );
}

export default AxisSystemProvider;
