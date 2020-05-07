import React, { createContext, ReactElement, ReactNode } from 'react';

export interface LineProps {
  data: number[];
}

export const LineContext = createContext<LineProps | undefined>(undefined);

type Props = LineProps & {
  children: ReactNode;
};

function LineProvider(props: Props): ReactElement {
  const { data, children } = props;

  return (
    <LineContext.Provider value={{ data }}>{children}</LineContext.Provider>
  );
}

export default LineProvider;
