import {
  HDF5Collection,
  HDF5TypeClass,
  HDF5ShapeClass,
  HDF5Metadata,
  HDF5Entity,
} from '../providers/models';
import { Vis } from '../dataset-visualizer/models';
import { VIS_DEFS } from '.';

const baseGroup = { id: 'group', collection: HDF5Collection.Groups as const };
const baseDataset = {
  id: 'dataset',
  collection: HDF5Collection.Datasets as const,
};
const baseDatatype = {
  id: 'datatype',
  collection: HDF5Collection.Datatypes as const,
};

function supportsEntity(
  vis: Vis,
  entity: HDF5Entity,
  metadata = {} as HDF5Metadata
): boolean {
  return VIS_DEFS[vis].supportsEntity(entity, metadata);
}

describe('Visualization definitions', () => {
  describe('Vis.Raw', () => {
    it('should support any dataset', () => {
      const supportedDatasets: HDF5Entity[] = [
        { ...baseDataset, type: '', shape: { class: HDF5ShapeClass.Null } },
      ];

      supportedDatasets.forEach((dataset) => {
        expect(supportsEntity(Vis.Raw, dataset)).toBe(true);
      });
    });

    it('should not support group and datatype', () => {
      const unsupportedEntities: HDF5Entity[] = [
        { ...baseGroup },
        { ...baseDatatype, type: '' },
      ];

      unsupportedEntities.forEach((dataset) => {
        expect(supportsEntity(Vis.Raw, dataset)).toBe(false);
      });
    });
  });

  describe('Vis.Scalar', () => {
    it('should support dataset with base type and scalar shape', () => {
      const supportedDatasets: HDF5Entity[] = [
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Scalar },
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Scalar },
        },
      ];

      supportedDatasets.forEach((dataset) => {
        expect(supportsEntity(Vis.Scalar, dataset)).toBe(true);
      });
    });

    it('should not support dataset with complex type or non-scalar shape', () => {
      const unsupportedDatasets: HDF5Entity[] = [
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Null }, // shape class not supported
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Compound, fields: [] }, // type class not supported
          shape: { class: HDF5ShapeClass.Scalar },
        },
      ];

      unsupportedDatasets.forEach((dataset) => {
        expect(supportsEntity(Vis.Scalar, dataset)).toBe(false);
      });
    });

    it('should not support group and datatype', () => {
      const unsupportedEntities: HDF5Entity[] = [
        { ...baseGroup },
        { ...baseDatatype, type: '' },
      ];

      unsupportedEntities.forEach((dataset) => {
        expect(supportsEntity(Vis.Scalar, dataset)).toBe(false);
      });
    });
  });

  describe('Vis.Matrix', () => {
    it('should support dataset with base type, simple shape and at least one dimension', () => {
      const supportedDatasets: HDF5Entity[] = [
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4] },
        },
        {
          ...baseDataset,
          type: {
            class: HDF5TypeClass.String,
            charSet: 'H5T_CSET_ASCII',
            strPad: 'H5T_STR_NULLPAD',
            length: 1,
          },
          shape: { class: HDF5ShapeClass.Simple, dims: [10, 12345] },
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 2, 3] }, // dims length supported with mapping
        },
      ];

      supportedDatasets.forEach((dataset) => {
        expect(supportsEntity(Vis.Matrix, dataset)).toBe(true);
      });
    });

    it('should not support dataset with complex type, non-simple shape or no dimension', () => {
      const unsupportedDatasets: HDF5Entity[] = [
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Compound, fields: [] }, // type class not supported
          shape: { class: HDF5ShapeClass.Simple, dims: [4] },
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Scalar }, // shape class not supported
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [] }, // dims length not supported
        },
      ];

      unsupportedDatasets.forEach((dataset) => {
        expect(supportsEntity(Vis.Matrix, dataset)).toBe(false);
      });
    });

    it('should not support group and datatype', () => {
      const unsupportedEntities: HDF5Entity[] = [
        { ...baseGroup },
        { ...baseDatatype, type: '' },
      ];

      unsupportedEntities.forEach((dataset) => {
        expect(supportsEntity(Vis.Matrix, dataset)).toBe(false);
      });
    });
  });

  describe('Vis.Line', () => {
    it('should support dataset with numeric type, simple shape and at least one dimension', () => {
      const supportedDatasets: HDF5Entity[] = [
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4] },
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [15] },
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 2] }, // dims length supported with mapping
        },
      ];

      supportedDatasets.forEach((dataset) => {
        expect(supportsEntity(Vis.Line, dataset)).toBe(true);
      });
    });

    it('should not support dataset with non-numeric type, non-simple shape or no dimension', () => {
      const unsupportedDatasets: HDF5Entity[] = [
        {
          ...baseDataset,
          type: {
            class: HDF5TypeClass.String, // type class not supported
            charSet: 'H5T_CSET_ASCII',
            strPad: 'H5T_STR_NULLPAD',
            length: 1,
          },
          shape: { class: HDF5ShapeClass.Simple, dims: [4] },
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Scalar }, // shape class not supported
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [] }, // dims length not supported
        },
      ];

      unsupportedDatasets.forEach((dataset) => {
        expect(supportsEntity(Vis.Line, dataset)).toBe(false);
      });
    });

    it('should not support group and datatype', () => {
      const unsupportedEntities: HDF5Entity[] = [
        { ...baseGroup },
        { ...baseDatatype, type: '' },
      ];

      unsupportedEntities.forEach((dataset) => {
        expect(supportsEntity(Vis.Line, dataset)).toBe(false);
      });
    });
  });

  describe('Vis.Heatmap', () => {
    it('should support dataset with numeric type, simple shape and at least two dimensions', () => {
      const supportedDatasets: HDF5Entity[] = [
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [15, 4] },
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 15] },
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 2, 5] }, // dims length supported with mapping
        },
      ];

      supportedDatasets.forEach((dataset) => {
        expect(supportsEntity(Vis.Heatmap, dataset)).toBe(true);
      });
    });

    it('should not support dataset with non-numeric type, non-simple shape or less than two dimensions', () => {
      const unsupportedDatasets: HDF5Entity[] = [
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Compound, fields: [] }, // type class not supported
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 15] },
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Scalar }, // shape class not supported
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [1] }, // dims length not supported
        },
      ];

      unsupportedDatasets.forEach((dataset) => {
        expect(supportsEntity(Vis.Heatmap, dataset)).toBe(false);
      });
    });

    it('should not support group and datatype', () => {
      const unsupportedEntities: HDF5Entity[] = [
        { ...baseGroup },
        { ...baseDatatype, type: '' },
      ];

      unsupportedEntities.forEach((dataset) => {
        expect(supportsEntity(Vis.Heatmap, dataset)).toBe(false);
      });
    });
  });
});
