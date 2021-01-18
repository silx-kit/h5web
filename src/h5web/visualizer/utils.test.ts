import { getSupportedVis } from './utils';
import { Vis } from '../visualizations';
import {
  compoundType,
  intType,
  scalarShape,
  makeStrAttr,
  makeDataset,
  makeGroup,
  makeNxDataGroup,
  makeSimpleDataset,
  makeIntAttr,
} from '../providers/mock/data-utils';

describe('Visualizer utilities', () => {
  describe('getSupportedVis', () => {
    it('should return supported visualizations', () => {
      const datasetRaw = makeDataset('raw', scalarShape, compoundType);
      const supportedVis = getSupportedVis(datasetRaw);

      expect(supportedVis).toEqual([Vis.Raw]);
    });

    it('should not include Raw vis if any other visualization is supported', () => {
      const datasetInt1D = makeSimpleDataset('dataset', intType, [5]);
      const supportedVis = getSupportedVis(datasetInt1D);

      expect(supportedVis).toEqual([Vis.Matrix, Vis.Line]);
    });

    it('should not include NxSpectrum vis if any other visualization is supported', () => {
      const datasetInt2D = makeSimpleDataset('dataset', intType, [5, 3]);
      const nxDataSignal2D = makeNxDataGroup('foo', { signal: datasetInt2D });
      const supportedVis = getSupportedVis(nxDataSignal2D);

      expect(supportedVis).toEqual([Vis.NxImage]);
    });

    it('should return empty array if no visualization is supported', () => {
      const groupEmpty = makeGroup('group_empty');
      const supportedVis = getSupportedVis(groupEmpty);

      expect(supportedVis).toEqual([]);
    });

    it('should return error if entity has malformed NeXus metadata', () => {
      const nxDataMalformed = makeGroup('foo', [], {
        attributes: [
          makeStrAttr('NX_class', 'NXdata'),
          makeIntAttr('signal', 42), // `signal` attribute should be string
        ],
      });

      expect(() => getSupportedVis(nxDataMalformed)).toThrow(/to be a string/u);
    });
  });
});
