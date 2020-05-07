import React, { createContext, ReactElement, ReactNode } from 'react';
import { Dims } from './models';

export interface HeatmapProps {
  dims: Dims;
  data: number[][];
}

export const HeatmapContext = createContext<HeatmapProps | undefined>(
  undefined
);

type Props = HeatmapProps & {
  children: ReactNode;
};

function HeatmapProvider(props: Props): ReactElement {
  const { dims, data, children } = props;

  return (
    <HeatmapContext.Provider value={{ dims, data }}>
      {children}
    </HeatmapContext.Provider>
  );
}

export default HeatmapProvider;
