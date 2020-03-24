import React, { ReactNode, createContext } from 'react';

interface Props {
  stickyIndices: boolean;
  toggleStickyIndices: () => void;
  children: ReactNode;
}

export const StickyContext = createContext({
  stickyIndices: true,
  toggleStickyIndices: () => {},
});

function StickyProvider(props: Props): JSX.Element {
  const { stickyIndices, toggleStickyIndices, children } = props;

  return (
    <StickyContext.Provider value={{ stickyIndices, toggleStickyIndices }}>
      {children}
    </StickyContext.Provider>
  );
}

export default StickyProvider;
