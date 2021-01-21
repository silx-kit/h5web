import { CORE_VIS } from './visualizations';
import {
  intType,
  compoundType,
  scalarShape,
  stringType,
  floatType,
  makeSimpleShape,
  makeDataset,
  makeSimpleDataset,
} from '../../providers/mock/data-utils';

const datasetIntScalar = makeDataset('dataset_int', scalarShape, intType);
const datasetFltScalar = makeDataset('dataset_flt', scalarShape, floatType);
const datasetStrScalar = makeDataset('dataset_flt', scalarShape, stringType);
const datasetInt0D = makeSimpleDataset('dataset_int_0d', intType, []);
const datasetInt1D = makeSimpleDataset('dataset_int_1d', intType, [5]);
const datasetInt2D = makeSimpleDataset('dataset_int_2d', intType, [5, 3]);
const datasetStr2D = makeSimpleDataset('dataset_str_2d', stringType, [5, 3]);
const datasetFlt3D = makeSimpleDataset('dataset_flt_3d', intType, [5, 3, 1]);

describe('Core visualizations', () => {
  describe('Raw', () => {
    const { supportsDataset } = CORE_VIS.Raw;

    it('should support any dataset', () => {
      expect(supportsDataset(datasetIntScalar)).toBe(true);
      expect(supportsDataset(datasetStr2D)).toBe(true);
    });
  });

  describe('Scalar', () => {
    const { supportsDataset } = CORE_VIS.Scalar;

    it('should support dataset with base type and scalar shape', () => {
      expect(supportsDataset(datasetIntScalar)).toBe(true);
      expect(supportsDataset(datasetFltScalar)).toBe(true);
      expect(supportsDataset(datasetStrScalar)).toBe(true);
    });

    it('should not support dataset with advanced type', () => {
      const dataset = makeDataset('foo', scalarShape, compoundType);
      expect(supportsDataset(dataset)).toBe(false);
    });

    it('should not support dataset with non-scalar shape', () => {
      expect(supportsDataset(datasetInt1D)).toBe(false);
    });
  });

  describe('Matrix', () => {
    const { supportsDataset } = CORE_VIS.Matrix;

    it('should support dataset with base type, simple shape and at least one dimension', () => {
      expect(supportsDataset(datasetInt1D)).toBe(true);
      expect(supportsDataset(datasetStr2D)).toBe(true);
      expect(supportsDataset(datasetFlt3D)).toBe(true);
    });

    it('should not support dataset with advanced type', () => {
      const dataset = makeDataset('foo', makeSimpleShape([1]), compoundType);
      expect(supportsDataset(dataset)).toBe(false);
    });

    it('should not support dataset with non-simple shape', () => {
      expect(supportsDataset(datasetIntScalar)).toBe(false);
    });

    it('should not support dataset with no dimension', () => {
      expect(supportsDataset(datasetInt0D)).toBe(false);
    });
  });

  describe('Line', () => {
    const { supportsDataset } = CORE_VIS.Line;

    it('should support dataset with numeric type, simple shape and at least one dimension', () => {
      expect(supportsDataset(datasetInt1D)).toBe(true);
      expect(supportsDataset(datasetFlt3D)).toBe(true);
    });

    it('should not support dataset with non-numeric type', () => {
      expect(supportsDataset(datasetStr2D)).toBe(false);
    });

    it('should not support dataset with non-simple shape', () => {
      expect(supportsDataset(datasetIntScalar)).toBe(false);
    });

    it('should not support dataset with no dimension', () => {
      expect(supportsDataset(datasetInt0D)).toBe(false);
    });
  });

  describe('Heatmap', () => {
    const { supportsDataset } = CORE_VIS.Heatmap;

    it('should support dataset with numeric type, simple shape and at least two dimensions', () => {
      expect(supportsDataset(datasetInt2D)).toBe(true);
      expect(supportsDataset(datasetFlt3D)).toBe(true);
    });

    it('should not support dataset with non-numeric type', () => {
      expect(supportsDataset(datasetStr2D)).toBe(false);
    });

    it('should not support dataset with non-simple shape', () => {
      expect(supportsDataset(datasetIntScalar)).toBe(false);
    });

    it('should not support dataset with less than two dimensions', () => {
      expect(supportsDataset(datasetInt1D)).toBe(false);
    });
  });
});
