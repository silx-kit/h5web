import React, { createContext, ReactElement, ReactNode } from 'react';
import { AxisConfig } from './models';

export interface DisplayAxisProps {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
}

export const AxisSystemContext = createContext<DisplayAxisProps>(
  {} as DisplayAxisProps
);

type Props = DisplayAxisProps & {
  children: ReactNode;
};

function AxisSystemProvider(props: Props): ReactElement {
  const { children, ...valueProps } = props;

  return (
    <AxisSystemContext.Provider value={valueProps}>
      {children}
    </AxisSystemContext.Provider>
  );
}

export default AxisSystemProvider;
