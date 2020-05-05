import React, { ReactNode, createContext } from 'react';
import { HDF5Value } from '../../providers/models';
import { Size } from '../shared/models';

export interface GridSettings {
  cellSize: Size;
  rowCount: number;
  columnCount: number;
  valueAccessor: (row: number, col: number) => HDF5Value;
}

export const GridSettingsContext = createContext<GridSettings>({
  cellSize: { width: 0, height: 0 },
  rowCount: 0,
  columnCount: 0,
  valueAccessor: () => 0,
});

type Props = GridSettings & { children: ReactNode };

function GridSettingsProvider(props: Props): JSX.Element {
  const { children, ...settings } = props;

  return (
    <GridSettingsContext.Provider value={settings}>
      {children}
    </GridSettingsContext.Provider>
  );
}

export default GridSettingsProvider;
