import { useState, useMemo, createContext } from 'react';
import type { ReactNode } from 'react';
import type { GridOnItemsRenderedProps } from 'react-window';

import type { Size } from '../models';

interface GridSettings {
  rowCount: number;
  columnCount: number;
  cellSize: Size;
  sticky: boolean;
  rowHeaderCellsWidth: number;
  columnHeaders?: string[];
  cellFormatter: (row: number, col: number) => string;
  setRenderedItems: (renderedItems: GridOnItemsRenderedProps) => void;
}

interface Props extends Omit<GridSettings, 'setRenderedItems'> {
  children: ReactNode;
}

export const SettingsContext = createContext({} as GridSettings);
export const RenderedItemsContext = createContext<
  GridOnItemsRenderedProps | undefined
>(undefined);

function GridProvider(props: Props) {
  const {
    rowCount,
    columnCount,
    cellSize,
    sticky,
    rowHeaderCellsWidth,
    columnHeaders,
    children,
    cellFormatter,
  } = props;

  const [renderedItems, setRenderedItems] =
    useState<GridOnItemsRenderedProps>();

  const settings = useMemo(
    () => ({
      rowCount,
      columnCount,
      cellSize,
      sticky,
      rowHeaderCellsWidth,
      columnHeaders,
      cellFormatter,
      setRenderedItems,
    }),
    [
      rowHeaderCellsWidth,
      cellFormatter,
      cellSize,
      columnCount,
      sticky,
      rowCount,
      columnHeaders,
    ]
  );

  return (
    <SettingsContext.Provider value={settings}>
      <RenderedItemsContext.Provider value={renderedItems}>
        {children}
      </RenderedItemsContext.Provider>
    </SettingsContext.Provider>
  );
}

export default GridProvider;
