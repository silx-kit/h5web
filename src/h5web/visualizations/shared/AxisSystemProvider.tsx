import React, { createContext, ReactElement, ReactNode } from 'react';
import { AxisDomains } from './models';

export interface DisplayAxisProps {
  axisDomains: AxisDomains;
  showGrid?: boolean;
  hasXLogScale?: boolean;
  hasYLogScale?: boolean;
}

export const AxisSystemContext = createContext<DisplayAxisProps>({
  axisDomains: { x: [0, 1], y: [0, 1] },
});

type Props = DisplayAxisProps & {
  children: ReactNode;
};

function AxisSystemProvider(props: Props): ReactElement {
  const { axisDomains, showGrid, hasXLogScale, hasYLogScale, children } = props;

  return (
    <AxisSystemContext.Provider
      value={{ axisDomains, showGrid, hasXLogScale, hasYLogScale }}
    >
      {children}
    </AxisSystemContext.Provider>
  );
}

export default AxisSystemProvider;
