import { getSupportedVis } from './utils';
import { Vis } from '../visualizations';
import {
  makeDataset,
  makeSimpleDataset,
  makeAttr,
  makeStrAttr,
  intType,
  compoundType,
  scalarShape,
  makeGroup,
  makeMetadata,
} from '../providers/mock/data';

const metadata = makeMetadata();

describe('Visualizer utilities', () => {
  describe('getSupportedVis', () => {
    it('should identify dataset as supporting raw vis', () => {
      const dataset = makeDataset('foo', compoundType, scalarShape);
      const supportedVis = getSupportedVis(dataset, metadata);
      expect(supportedVis).toEqual({ supportedVis: [Vis.Raw] });
    });

    it('should not include raw vis if any other visualization is supported', () => {
      const dataset = makeSimpleDataset('foo', intType, [4]);
      const supportedVis = getSupportedVis(dataset, metadata);
      expect(supportedVis).toEqual({ supportedVis: [Vis.Matrix, Vis.Line] });
    });

    it('should return empty array if no visualization supports entity', () => {
      const group = makeGroup('foo');
      const supportedVis = getSupportedVis(group, metadata);
      expect(supportedVis).toEqual({ supportedVis: [] });
    });

    it('should return error if entity has malformed NeXus metadata', () => {
      const group = makeGroup('foo', [
        makeStrAttr('NX_class', 'NXdata'),
        makeAttr('signal', scalarShape, intType, 42),
      ]);

      const supportedVis = getSupportedVis(group, metadata);

      expect(supportedVis).toEqual({
        supportedVis: [],
        error: expect.any(TypeError),
      });
    });
  });
});
