import type Complex from 'complex.js';
import { ReactNode, createContext, ReactElement } from 'react';
import type { Size } from '../models';

interface GridSettings {
  cellSize: Size;
  rowCount: number;
  columnCount: number;
  valueAccessor: (
    row: number,
    col: number
  ) => number | string | boolean | Complex;
}

export const GridSettingsContext = createContext<GridSettings>({
  cellSize: { width: 0, height: 0 },
  rowCount: 0,
  columnCount: 0,
  valueAccessor: () => 0,
});

type Props = GridSettings & { children: ReactNode };

function GridSettingsProvider(props: Props): ReactElement {
  const { children, ...settings } = props;

  return (
    <GridSettingsContext.Provider value={settings}>
      {children}
    </GridSettingsContext.Provider>
  );
}

export default GridSettingsProvider;
