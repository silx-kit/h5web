import { useThree } from '@react-three/fiber';
import type { PropsWithChildren } from 'react';

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

  return (
    <AxisSystemContext.Provider
      value={{
        abscissaConfig,
        ordinateConfig,
        abscissaScale,
        ordinateScale,
        visSize,
      }}
    >
      {children}
    </AxisSystemContext.Provider>
  );
}

export default AxisSystemProvider;
