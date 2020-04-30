import React, { createContext, ReactElement, ReactNode } from 'react';
import { AxisOffsets } from '../shared/models';

export interface LineVisProps {
  data: number[];
  axisOffsets: AxisOffsets;
}

export const LineVisContext = createContext<LineVisProps | undefined>(
  undefined
);

type Props = LineVisProps & {
  children: ReactNode;
};

function LineVisProvider(props: Props): ReactElement {
  const { data, axisOffsets, children } = props;

  return (
    <LineVisContext.Provider value={{ data, axisOffsets }}>
      {children}
    </LineVisContext.Provider>
  );
}

export default LineVisProvider;
