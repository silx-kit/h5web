import {
  HDF5Collection,
  HDF5TypeClass,
  HDF5ShapeClass,
  HDF5Metadata,
  HDF5Entity,
  HDF5Attribute,
  HDF5LinkClass,
} from '../providers/models';
import { Vis, VIS_DEFS } from '.';
import { NxInterpretation } from './nexus/models';

const baseGroup = { id: 'group', collection: HDF5Collection.Groups as const };
const baseDataset = {
  id: 'dataset',
  collection: HDF5Collection.Datasets as const,
};
const baseDatatype = {
  id: 'datatype',
  collection: HDF5Collection.Datatypes as const,
};

const nxDataGroup = {
  ...baseGroup,
  attributes: [
    { name: 'NX_class', value: 'NXdata' },
    { name: 'signal', value: 'my_signal' },
  ] as HDF5Attribute[],
  links: [
    {
      class: HDF5LinkClass.Hard as const,
      title: 'my_signal',
      collection: HDF5Collection.Datasets,
      id: baseDataset.id,
    },
  ],
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

      unsupportedEntities.forEach((entity) => {
        expect(supportsEntity(Vis.Raw, entity)).toBe(false);
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

      unsupportedEntities.forEach((entity) => {
        expect(supportsEntity(Vis.Scalar, entity)).toBe(false);
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

      unsupportedEntities.forEach((entity) => {
        expect(supportsEntity(Vis.Matrix, entity)).toBe(false);
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

      unsupportedEntities.forEach((entity) => {
        expect(supportsEntity(Vis.Line, entity)).toBe(false);
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

      unsupportedEntities.forEach((entity) => {
        expect(supportsEntity(Vis.Heatmap, entity)).toBe(false);
      });
    });
  });

  describe('Vis.NxSpectrum', () => {
    const nxSpectrumDef = VIS_DEFS[Vis.NxSpectrum];

    it('should support NXdata group referencing signal with spectrum interpretation', () => {
      const metadata = {
        datasets: {
          [baseDataset.id]: {
            ...baseDataset,
            attributes: [
              { name: 'interpretation', value: NxInterpretation.Spectrum },
            ],
          },
        },
      } as HDF5Metadata;

      const supported = nxSpectrumDef.supportsEntity(nxDataGroup, metadata);
      expect(supported).toBe(true);
    });

    it('should support NXdata group referencing signal with numeric type, simple shape, one dimension and no or unknown interpretation', () => {
      const supportedSignals: HDF5Entity[] = [
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [1] },
          attributes: [], // no interpretation
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F32BE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [1] },
          attributes: [
            { name: 'interpretation', value: 'unknown' } as HDF5Attribute, // unknown interpretation
          ],
        },
      ];

      supportedSignals.forEach((signal) => {
        const metadata = {
          datasets: { [baseDataset.id]: signal },
        } as HDF5Metadata;

        const supported = nxSpectrumDef.supportsEntity(nxDataGroup, metadata);
        expect(supported).toBe(true);
      });
    });

    it('should not support NXdata group referencing signal with non-numeric type, non-simple shape, no dimension or non-spectrum interpretation', () => {
      const unsupportedSignals: HDF5Entity[] = [
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
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F64LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4] },
          attributes: [
            {
              name: 'interpretation',
              value: NxInterpretation.Image, // known, non-spectrum interpretation
            } as HDF5Attribute,
          ],
        },
      ];

      unsupportedSignals.forEach((signal) => {
        const metadata = {
          datasets: { [baseDataset.id]: signal },
        } as HDF5Metadata;

        const supported = nxSpectrumDef.supportsEntity(nxDataGroup, metadata);
        expect(supported).toBe(false);
      });
    });

    it('should not support NXdata group referencing inexistent signal', () => {
      const metadata = {} as HDF5Metadata;
      const supported = nxSpectrumDef.supportsEntity(nxDataGroup, metadata);
      expect(supported).toBe(false);
    });

    it('should not support NXdata group with missing signal link', () => {
      const supported = nxSpectrumDef.supportsEntity(
        { ...nxDataGroup, links: [] },
        {} as HDF5Metadata
      );

      expect(supported).toBe(false);
    });

    it('should not support dataset, datatype and non-NXdata group', () => {
      const unsupportedEntities: HDF5Entity[] = [
        { ...baseDataset, type: '', shape: { class: HDF5ShapeClass.Null } },
        { ...baseDatatype, type: '' },
        { ...baseGroup },
      ];

      unsupportedEntities.forEach((entity) => {
        expect(supportsEntity(Vis.NxSpectrum, entity)).toBe(false);
      });
    });
  });

  describe('Vis.NxImage', () => {
    const nxImageDef = VIS_DEFS[Vis.NxImage];

    it('should support NXdata group referencing signal with image interpretation', () => {
      const metadata = {
        datasets: {
          [baseDataset.id]: {
            ...baseDataset,
            attributes: [
              { name: 'interpretation', value: NxInterpretation.Image },
            ],
          },
        },
      } as HDF5Metadata;

      const supported = nxImageDef.supportsEntity(nxDataGroup, metadata);
      expect(supported).toBe(true);
    });

    it('should support NXdata group referencing signal with numeric type, simple shape, two dimensions and no interpretation', () => {
      const metadata = {
        datasets: {
          [baseDataset.id]: {
            ...baseDataset,
            type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
            shape: { class: HDF5ShapeClass.Simple, dims: [1, 2] },
          },
        },
      } as HDF5Metadata;

      const supported = nxImageDef.supportsEntity(nxDataGroup, metadata);
      expect(supported).toBe(true);
    });

    it('should support NXdata group referencing signal with numeric type, simple shape, more than two dimensions and no or unknown interpretation', () => {
      const supportedSignals: HDF5Entity[] = [
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [1, 2] },
          attributes: [], // no attributes
        },
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Float, base: 'H5T_IEEE_F32BE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [1, 2, 3, 4] },
          attributes: [
            { name: 'interpretation', value: 'unknown' } as HDF5Attribute,
          ], // unknown interpretation
        },
      ];

      supportedSignals.forEach((signal) => {
        const metadata = {
          datasets: { [baseDataset.id]: signal },
        } as HDF5Metadata;

        const supported = nxImageDef.supportsEntity(nxDataGroup, metadata);
        expect(supported).toBe(true);
      });
    });

    it('should not support NXdata group referencing signal with non-numeric type, non-simple shape, less than two dimensions or non-image interpretation', () => {
      const unsupportedSignals: HDF5Entity[] = [
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
        {
          ...baseDataset,
          type: { class: HDF5TypeClass.Integer, base: 'H5T_STD_I32LE' },
          shape: { class: HDF5ShapeClass.Simple, dims: [4, 15] },
          attributes: [
            {
              name: 'interpretation',
              value: NxInterpretation.Spectrum,
            } as HDF5Attribute, // known, non-image interpretation
          ],
        },
      ];

      unsupportedSignals.forEach((signal) => {
        const metadata = {
          datasets: { [baseDataset.id]: signal },
        } as HDF5Metadata;

        const supported = nxImageDef.supportsEntity(nxDataGroup, metadata);
        expect(supported).toBe(false);
      });
    });

    it('should not support NXdata group referencing inexistent signal', () => {
      const metadata = {} as HDF5Metadata;
      const supported = nxImageDef.supportsEntity(nxDataGroup, metadata);
      expect(supported).toBe(false);
    });

    it('should not support NXdata group with missing signal link', () => {
      const supported = nxImageDef.supportsEntity(
        { ...nxDataGroup, links: [] },
        {} as HDF5Metadata
      );

      expect(supported).toBe(false);
    });

    it('should not support dataset, datatype and non-NXdata group', () => {
      const unsupportedEntities: HDF5Entity[] = [
        { ...baseDataset, type: '', shape: { class: HDF5ShapeClass.Null } },
        { ...baseDatatype, type: '' },
        { ...baseGroup },
      ];

      unsupportedEntities.forEach((entity) => {
        expect(supportsEntity(Vis.NxImage, entity)).toBe(false);
      });
    });
  });
});
