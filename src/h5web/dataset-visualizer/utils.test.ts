import { getSupportedVis } from './utils';
import {
  HDF5Collection,
  HDF5TypeClass,
  HDF5ShapeClass,
  HDF5Dataset,
} from '../providers/models';
import { Vis } from './models';

const base = { id: 'dataset', collection: HDF5Collection.Datasets as const };

describe('Dataset Visualizer utilities', () => {
  describe('getSupportedVis', () => {
    it('should include Scalar Vis when passed a supported dataset', () => {
      const supportedDatasets: HDF5Dataset[] = [
        {
          ...base,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Scalar },
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Scalar },
        },
      ];

      supportedDatasets.forEach(dataset => {
        expect(getSupportedVis(dataset)).toContain(Vis.Scalar);
      });
    });

    it('should not include Scalar Vis when passed an unsupported dataset', () => {
      const unsupportedDatasets: HDF5Dataset[] = [
        {
          ...base,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Null }, // shape class not supported
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Compound, fields: [] }, // type class not supported
          shape: { class: HDF5ShapeClass.Scalar },
        },
      ];

      unsupportedDatasets.forEach(dataset => {
        expect(getSupportedVis(dataset)).not.toContain(Vis.Scalar);
      });
    });

    it('should include Matrix Vis when passed a supported dataset', () => {
      const supportedDatasets: HDF5Dataset[] = [
        {
          ...base,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4] },
        },
        {
          ...base,
          type: {
            class: HDF5TypeClass.String,
            charSet: 'H5T_CSET_ASCII',
            strPad: 'H5T_STR_NULLPAD',
            length: 1,
          },
          shape: { class: HDF5ShapeClass.Simple, dims: [10, 12345] },
        },
      ];

      supportedDatasets.forEach(dataset => {
        expect(getSupportedVis(dataset)).toContain(Vis.Matrix);
      });
    });

    it('should not include Matrix Vis when passed an unsupported dataset', () => {
      const unsupportedDatasets: HDF5Dataset[] = [
        {
          ...base,
          type: { class: HDF5TypeClass.Compound, fields: [] }, // type class not supported
          shape: { class: HDF5ShapeClass.Simple, dims: [4] },
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Scalar }, // shape class not supported
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [] }, // dims length not supported
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 2, 3] }, // dims length not supported
        },
      ];

      unsupportedDatasets.forEach(dataset => {
        expect(getSupportedVis(dataset)).not.toContain(Vis.Matrix);
      });
    });

    it('should include Line Vis when passed a supported dataset', () => {
      const supportedDatasets: HDF5Dataset[] = [
        {
          ...base,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4] },
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [15] },
        },
      ];

      supportedDatasets.forEach(dataset => {
        expect(getSupportedVis(dataset)).toContain(Vis.Line);
      });
    });

    it('should not include Line Vis when passed an unsupported dataset', () => {
      const unsupportedDatasets: HDF5Dataset[] = [
        {
          ...base,
          type: {
            class: HDF5TypeClass.String, // type class not supported
            charSet: 'H5T_CSET_ASCII',
            strPad: 'H5T_STR_NULLPAD',
            length: 1,
          },
          shape: { class: HDF5ShapeClass.Simple, dims: [4] },
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Scalar }, // shape class not supported
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [] }, // dims length not supported
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 2] }, // dims length not supported
        },
      ];

      unsupportedDatasets.forEach(dataset => {
        expect(getSupportedVis(dataset)).not.toContain(Vis.Line);
      });
    });

    it('should include Heatmap Vis when passed a supported dataset', () => {
      const supportedDatasets: HDF5Dataset[] = [
        {
          ...base,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [15, 4] },
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 15] },
        },
      ];

      supportedDatasets.forEach(dataset => {
        expect(getSupportedVis(dataset)).toContain(Vis.Heatmap);
      });
    });

    it('should not include Heatmap Vis when passed an unsupported dataset', () => {
      const unsupportedDatasets: HDF5Dataset[] = [
        {
          ...base,
          type: { class: HDF5TypeClass.Compound, fields: [] }, // type class not supported
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 15] },
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Scalar }, // shape class not supported
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [1] }, // dims length not supported
        },
        {
          ...base,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 2, 5] }, // dims length not supported
        },
      ];

      unsupportedDatasets.forEach(dataset => {
        expect(getSupportedVis(dataset)).not.toContain(Vis.Heatmap);
      });
    });

    it('should include Raw Vis when no other visualization is supported', () => {
      expect(
        getSupportedVis({
          ...base,
          type: 'some-dataset-id',
          shape: { class: HDF5ShapeClass.Null },
        })
      ).toEqual([Vis.Raw]);
    });

    it('should not include Raw Vis when any other visualization is supported', () => {
      expect(
        getSupportedVis({
          ...base,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4] },
        })
      ).not.toContain(Vis.Raw);
    });
  });
});
