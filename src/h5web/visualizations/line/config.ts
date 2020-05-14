import { StorageConfig, createPersistableState } from '../../storage-utils';
import { Glyph } from './models';

type LineConfig = {
  glyph: Glyph;
  setGlyph: (g: Glyph) => void;
  showGrid: boolean;
  toggleGrid: () => void;
  hasYLogScale: boolean;
  toggleYLogScale: () => void;
};

const STORAGE_CONFIG: StorageConfig = {
  storageId: 'h5web:line',
  itemsToPersist: ['glyph', 'showGrid', 'hasYLogScale'],
};

export const [useLineConfig] = createPersistableState<LineConfig>(
  STORAGE_CONFIG,
  set => ({
    glyph: Glyph.Line,
    setGlyph: (g: Glyph) => set({ glyph: g }),
    showGrid: true,
    toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
    hasYLogScale: false,
    toggleYLogScale: () =>
      set(state => ({ hasYLogScale: !state.hasYLogScale })),
  })
);
