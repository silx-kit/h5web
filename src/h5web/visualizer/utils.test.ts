import { getSupportedVis } from './utils';
import {
  HDF5Metadata,
  HDF5ShapeClass,
  HDF5Collection,
  HDF5TypeClass,
  HDF5Dataset,
  HDF5Group,
} from '../providers/models';
import { Vis } from '../visualizations';

const metadata = {} as HDF5Metadata;
const baseDataset = {
  id: 'dataset',
  collection: HDF5Collection.Datasets as const,
};

describe('Visualizer utilities', () => {
  describe('getSupportedVis', () => {
    it('should identify dataset as supporting raw vis', () => {
      const dataset = {
        ...baseDataset,
        type: '',
        shape: { class: HDF5ShapeClass.Null },
      } as HDF5Dataset;

      const supportedVis = getSupportedVis(dataset, metadata);
      expect(supportedVis).toEqual([Vis.Raw]);
    });

    it('should not include raw vis if any other visualization is supported', () => {
      const dataset = {
        ...baseDataset,
        type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
        shape: { class: HDF5ShapeClass.Simple, dims: [4] },
      } as HDF5Dataset;

      const supportedVis = getSupportedVis(dataset, metadata);
      expect(supportedVis).toEqual([Vis.Matrix, Vis.Line]);
    });

    it('should return empty array if no visualization supports entity', () => {
      const group = {
        id: 'group',
        collection: HDF5Collection.Groups,
      } as HDF5Group;

      const supportedVis = getSupportedVis(group, metadata);
      expect(supportedVis).toEqual([]);
    });
  });
});
