import { HDF5Metadata, HDF5Entity } from '../providers/models';
import { Vis, VIS_DEFS } from '.';
import { NxInterpretation } from './nexus/models';
import {
  makeSimpleDataset,
  intType,
  makeGroup,
  makeDatatype,
  advancedType,
  makeDataset,
  scalarShape,
  makeSimpleShape,
  stringType,
  makeStrAttr,
  makeMetadata,
  withAttributes,
  makeDatasetHardLink,
  makeNxDataGroup,
  floatType,
} from '../providers/mock/data';

const datasetIntScalar = makeDataset('dataset_int', intType, scalarShape);
const datasetFltScalar = makeDataset('dataset_flt', floatType, scalarShape);
const datasetStrScalar = makeDataset('dataset_flt', stringType, scalarShape);
const datasetInt0D = makeSimpleDataset('dataset_int_0d', intType, []);
const datasetInt1D = makeSimpleDataset('dataset_int_1d', intType, [5]);
const datasetInt2D = makeSimpleDataset('dataset_int_2d', intType, [5, 3]);
const datasetStr1D = makeSimpleDataset('dataset_str_1d', stringType, [5]);
const datasetStr2D = makeSimpleDataset('dataset_str_2d', stringType, [5, 3]);
const datasetFlt3D = makeSimpleDataset('dataset_flt_3d', intType, [5, 3, 1]);

const groupEmpty = makeGroup('group_empty');
const datatypeInt = makeDatatype('datatype_int', intType);

function makeSupportFn(
  vis: Vis
): (entity: HDF5Entity, metadata?: HDF5Metadata) => boolean {
  return (entity: HDF5Entity, metadata = {} as HDF5Metadata) =>
    VIS_DEFS[vis].supportsEntity(entity, metadata);
}

describe('Visualization definitions', () => {
  describe('Vis.Raw', () => {
    const supportsEntity = makeSupportFn(Vis.Raw);

    it('should support any dataset', () => {
      expect(supportsEntity(datasetInt1D)).toBe(true);
    });

    it('should not support group and datatype', () => {
      expect(supportsEntity(groupEmpty)).toBe(false);
      expect(supportsEntity(datatypeInt)).toBe(false);
    });
  });

  describe('Vis.Scalar', () => {
    const supportsEntity = makeSupportFn(Vis.Scalar);

    it('should support dataset with base type and scalar shape', () => {
      expect(supportsEntity(datasetIntScalar)).toBe(true);
      expect(supportsEntity(datasetFltScalar)).toBe(true);
      expect(supportsEntity(datasetStrScalar)).toBe(true);
    });

    it('should not support dataset with advanced type', () => {
      const dataset = makeDataset('foo', advancedType, scalarShape);
      expect(supportsEntity(dataset)).toBe(false);
    });

    it('should not support dataset with non-scalar shape', () => {
      expect(supportsEntity(datasetInt1D)).toBe(false);
    });

    it('should not support group and datatype', () => {
      expect(supportsEntity(groupEmpty)).toBe(false);
      expect(supportsEntity(datatypeInt)).toBe(false);
    });
  });

  describe('Vis.Matrix', () => {
    const supportsEntity = makeSupportFn(Vis.Matrix);

    it('should support dataset with base type, simple shape and at least one dimension', () => {
      expect(supportsEntity(datasetInt1D)).toBe(true);
      expect(supportsEntity(datasetStr2D)).toBe(true);
      expect(supportsEntity(datasetFlt3D)).toBe(true);
    });

    it('should not support dataset with advanced type', () => {
      const dataset = makeDataset('foo', advancedType, makeSimpleShape([1]));
      expect(supportsEntity(dataset)).toBe(false);
    });

    it('should not support dataset with non-simple shape', () => {
      expect(supportsEntity(datasetIntScalar)).toBe(false);
    });

    it('should not support dataset with no dimension', () => {
      expect(supportsEntity(datasetInt0D)).toBe(false);
    });

    it('should not support group and datatype', () => {
      expect(supportsEntity(groupEmpty)).toBe(false);
      expect(supportsEntity(datatypeInt)).toBe(false);
    });
  });

  describe('Vis.Line', () => {
    const supportsEntity = makeSupportFn(Vis.Line);

    it('should support dataset with numeric type, simple shape and at least one dimension', () => {
      expect(supportsEntity(datasetInt1D)).toBe(true);
      expect(supportsEntity(datasetFlt3D)).toBe(true);
    });

    it('should not support dataset with non-numeric type', () => {
      expect(supportsEntity(datasetStr2D)).toBe(false);
    });

    it('should not support dataset with non-simple shape', () => {
      expect(supportsEntity(datasetIntScalar)).toBe(false);
    });

    it('should not support dataset with no dimension', () => {
      expect(supportsEntity(datasetInt0D)).toBe(false);
    });

    it('should not support group and datatype', () => {
      expect(supportsEntity(groupEmpty)).toBe(false);
      expect(supportsEntity(datatypeInt)).toBe(false);
    });
  });

  describe('Vis.Heatmap', () => {
    const supportsEntity = makeSupportFn(Vis.Heatmap);

    it('should support dataset with numeric type, simple shape and at least two dimensions', () => {
      expect(supportsEntity(datasetInt2D)).toBe(true);
      expect(supportsEntity(datasetFlt3D)).toBe(true);
    });

    it('should not support dataset with non-numeric type', () => {
      expect(supportsEntity(datasetStr2D)).toBe(false);
    });

    it('should not support dataset with non-simple shape', () => {
      expect(supportsEntity(datasetIntScalar)).toBe(false);
    });

    it('should not support dataset with less than two dimensions', () => {
      expect(supportsEntity(datasetInt1D)).toBe(false);
    });

    it('should not support group and datatype', () => {
      expect(supportsEntity(groupEmpty)).toBe(false);
      expect(supportsEntity(datatypeInt)).toBe(false);
    });
  });

  describe('Vis.NxSpectrum', () => {
    const supportsEntity = makeSupportFn(Vis.NxSpectrum);

    it('should support NXdata group referencing signal with spectrum interpretation', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt1D.id },
      });

      const metadata = makeMetadata({
        datasets: [
          withAttributes(datasetInt1D, [
            makeStrAttr('interpretation', NxInterpretation.Spectrum),
          ]),
        ],
      });

      expect(supportsEntity(group, metadata)).toBe(true);
    });

    it('should support NXdata group referencing signal with numeric type, simple shape, one dimension and no interpretation', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt1D.id },
      });

      const metadata = makeMetadata({ datasets: [datasetInt1D] });
      expect(supportsEntity(group, metadata)).toBe(true);
    });

    it('should support NXdata group referencing signal with numeric type, simple shape, one dimension and unknown interpretation', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt1D.id },
      });

      const metadata = makeMetadata({
        datasets: [
          withAttributes(datasetInt1D, [
            makeStrAttr('interpretation', 'unknown'),
          ]),
        ],
      });

      expect(supportsEntity(group, metadata)).toBe(true);
    });

    it('should not support NXdata group referencing signal with non-numeric type', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetStr1D.id },
      });

      const metadata = makeMetadata({ datasets: [datasetStr1D] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group referencing signal with non-simple shape', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetIntScalar.id },
      });

      const metadata = makeMetadata({ datasets: [datasetIntScalar] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group referencing signal with no dimension', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt0D.id },
      });

      const metadata = makeMetadata({ datasets: [datasetInt0D] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group referencing signal with non-spectrum interpretation', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt1D.id },
      });

      const metadata = makeMetadata({
        datasets: [
          withAttributes(datasetInt1D, [
            makeStrAttr('interpretation', NxInterpretation.Image),
          ]),
        ],
      });

      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group referencing signal with spectrum interpretation but non-supported type/shape', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetIntScalar.id },
      });

      const metadata = makeMetadata({
        datasets: [
          withAttributes(datasetIntScalar, [
            makeStrAttr('interpretation', NxInterpretation.Spectrum),
          ]),
        ],
      });

      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group referencing inexistent signal', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt1D.id },
      });

      const metadata = makeMetadata();
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group with missing signal link', () => {
      const group = makeNxDataGroup('foo', { signal: 'my_signal' });
      const metadata = makeMetadata({ datasets: [datasetInt1D] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support non-NXdata group', () => {
      const group = makeGroup(
        'foo',
        [makeStrAttr('signal', 'my_signal')],
        [makeDatasetHardLink('my_signal', datasetInt1D.id)]
      );

      const metadata = makeMetadata({ datasets: [datasetInt1D] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support dataset with NXdata attributes', () => {
      const group = withAttributes(datasetInt1D, [
        makeStrAttr('NX_class', 'NXdata'),
        makeStrAttr('signal', 'my_signal'),
      ]);

      const metadata = makeMetadata({ datasets: [datasetInt1D] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });
  });

  describe('Vis.NxImage', () => {
    const supportsEntity = makeSupportFn(Vis.NxImage);

    it('should support NXdata group referencing signal with image interpretation', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt2D.id },
      });

      const metadata = makeMetadata({
        datasets: [
          withAttributes(datasetInt2D, [
            makeStrAttr('interpretation', NxInterpretation.Image),
          ]),
        ],
      });

      expect(supportsEntity(group, metadata)).toBe(true);
    });

    it('should support NXdata group referencing signal with numeric type, simple shape, two dimensions and no interpretation', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt2D.id },
      });

      const metadata = makeMetadata({ datasets: [datasetInt2D] });
      expect(supportsEntity(group, metadata)).toBe(true);
    });

    it('should support NXdata group referencing signal with numeric type, simple shape, more than two dimensions and unknown interpretation', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetFlt3D.id },
      });

      const metadata = makeMetadata({
        datasets: [
          withAttributes(datasetFlt3D, [
            makeStrAttr('interpretation', 'unknown'),
          ]),
        ],
      });

      expect(supportsEntity(group, metadata)).toBe(true);
    });

    it('should not support NXdata group referencing signal with non-numeric type', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetStr2D.id },
      });

      const metadata = makeMetadata({ datasets: [datasetStr2D] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group referencing signal with non-simple shape', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetIntScalar.id },
      });

      const metadata = makeMetadata({ datasets: [datasetIntScalar] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group referencing signal with less than two dimensions', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt1D.id },
      });

      const metadata = makeMetadata({ datasets: [datasetInt1D] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group referencing signal with non-image interpretation', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt2D.id },
      });

      const metadata = makeMetadata({
        datasets: [
          withAttributes(datasetInt2D, [
            makeStrAttr('interpretation', NxInterpretation.Spectrum),
          ]),
        ],
      });

      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group referencing signal with image interpretation but non-supported type/shape', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetIntScalar.id },
      });

      const metadata = makeMetadata({
        datasets: [
          withAttributes(datasetIntScalar, [
            makeStrAttr('interpretation', NxInterpretation.Image),
          ]),
        ],
      });

      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group referencing inexistent signal', () => {
      const group = makeNxDataGroup('foo', {
        signal: 'my_signal',
        ids: { my_signal: datasetInt1D.id },
      });

      const metadata = makeMetadata();
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support NXdata group with missing signal link', () => {
      const group = makeNxDataGroup('foo', { signal: 'my_signal' });
      const metadata = makeMetadata({ datasets: [datasetInt2D] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support non-NXdata group', () => {
      const group = makeGroup(
        'foo',
        [makeStrAttr('signal', 'my_signal')],
        [makeDatasetHardLink('my_signal', datasetInt2D.id)]
      );

      const metadata = makeMetadata({ datasets: [datasetInt2D] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });

    it('should not support dataset with NXdata attributes', () => {
      const group = withAttributes(datasetInt2D, [
        makeStrAttr('NX_class', 'NXdata'),
        makeStrAttr('signal', 'my_signal'),
      ]);

      const metadata = makeMetadata({ datasets: [datasetInt2D] });
      expect(supportsEntity(group, metadata)).toBe(false);
    });
  });
});
