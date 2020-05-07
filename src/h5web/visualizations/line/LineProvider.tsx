import React, { createContext, ReactElement, ReactNode } from 'react';
import { AxisOffsets } from '../shared/models';

export interface LineProps {
  data: number[];
  axisOffsets: AxisOffsets;
}

export const LineContext = createContext<LineProps | undefined>(undefined);

type Props = LineProps & {
  children: ReactNode;
};

function LineProvider(props: Props): ReactElement {
  const { data, axisOffsets, children } = props;

  return (
    <LineContext.Provider value={{ data, axisOffsets }}>
      {children}
    </LineContext.Provider>
  );
}

export default LineProvider;
