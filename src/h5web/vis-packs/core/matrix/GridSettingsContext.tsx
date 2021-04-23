import { ReactNode, createContext } from 'react';
import type { Size } from '../models';

interface GridSettings {
  cellSize: Size;
  rowCount: number;
  columnCount: number;
  cellFormatter: (row: number, col: number) => string;
}

export const GridSettingsContext = createContext<GridSettings>({
  cellSize: { width: 0, height: 0 },
  rowCount: 0,
  columnCount: 0,
  cellFormatter: () => '0',
});

interface Props extends GridSettings {
  children: ReactNode;
}

function GridSettingsProvider(props: Props) {
  const { children, ...settings } = props;

  return (
    <GridSettingsContext.Provider value={settings}>
      {children}
    </GridSettingsContext.Provider>
  );
}

export default GridSettingsProvider;
