import React, { createContext, ReactElement, ReactNode } from 'react';
import { Dims, AxisOffsets } from './models';

export interface HeatmapProps {
  dims: Dims;
  data: number[][];
  axisOffsets: AxisOffsets;
}

export const HeatmapContext = createContext<HeatmapProps | undefined>(
  undefined
);

type Props = HeatmapProps & {
  children: ReactNode;
};

function HeatmapProvider(props: Props): ReactElement {
  const { dims, data, axisOffsets, children } = props;

  return (
    <HeatmapContext.Provider value={{ dims, data, axisOffsets }}>
      {children}
    </HeatmapContext.Provider>
  );
}

export default HeatmapProvider;
