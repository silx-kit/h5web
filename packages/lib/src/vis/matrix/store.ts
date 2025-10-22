import { createStore, type StoreApi } from 'zustand';

import { type RenderedCells } from './models';

interface RenderedCellsState {
  renderedCells: RenderedCells;
  setRenderedCells: (renderedCells: RenderedCells) => void;
}

export type RenderedCellsStore = StoreApi<RenderedCellsState>;

export function createRenderedCellsStore(): RenderedCellsStore {
  return createStore<RenderedCellsState>()((set) => ({
    renderedCells: {
      columnStartIndex: 0,
      columnStopIndex: 0,
      rowStartIndex: 0,
      rowStopIndex: 0,
    },
    setRenderedCells: (renderedCells) => set({ renderedCells }),
  }));
}
