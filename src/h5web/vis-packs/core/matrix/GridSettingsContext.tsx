import { ReactNode, createContext } from 'react';
import type { Primitive } from '../../../providers/models';
import type { PrintableType, Size } from '../models';

interface GridSettings {
  cellSize: Size;
  rowCount: number;
  columnCount: number;
  valueAccessor: (row: number, col: number) => Primitive<PrintableType>;
}

export const GridSettingsContext = createContext<GridSettings>({
  cellSize: { width: 0, height: 0 },
  rowCount: 0,
  columnCount: 0,
  valueAccessor: () => 0,
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
