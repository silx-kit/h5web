import { CORE_VIS } from './visualizations';
import {
  intType,
  compoundType,
  stringType,
  floatType,
  makeDataset,
  booleanType,
  complexType,
  makeScalarDataset,
  unsignedType,
} from '../../providers/mock/metadata-utils';

const datasetIntScalar = makeScalarDataset('dataset_int', intType);
const datasetUnsignedScalar = makeScalarDataset('dataset_int', unsignedType);
const datasetFltScalar = makeScalarDataset('dataset_flt', floatType);
const datasetStrScalar = makeScalarDataset('dataset_flt', stringType);
const datasetBoolScalar = makeScalarDataset('dataset_bool', booleanType);
const datasetCplxScalar = makeScalarDataset('dataset_cplx', complexType);
const datasetInt1D = makeDataset('dataset_int_1d', intType, [5]);
const datasetUnsigned1D = makeDataset('dataset_int_1d', unsignedType, [5]);
const datasetBool1D = makeDataset('dataset_bool_1d', booleanType, [3]);
const datasetInt2D = makeDataset('dataset_int_2d', intType, [5, 3]);
const datasetUnsigned2D = makeDataset('dataset_int_2d', unsignedType, [5, 3]);
const datasetCplx2D = makeDataset('dataset_cplx_2D', complexType, [2, 2]);
const datasetStr2D = makeDataset('dataset_str_2d', stringType, [5, 3]);
const datasetFlt3D = makeDataset('dataset_flt_3d', intType, [5, 3, 1]);

describe('Raw', () => {
  const { supportsDataset } = CORE_VIS.Raw;

  it('should support any dataset', () => {
    expect(supportsDataset(datasetIntScalar)).toBe(true);
    expect(supportsDataset(datasetStr2D)).toBe(true);
  });
});

describe('Scalar', () => {
  const { supportsDataset } = CORE_VIS.Scalar;

  it('should support dataset with displayable type and scalar shape', () => {
    expect(supportsDataset(datasetIntScalar)).toBe(true);
    expect(supportsDataset(datasetUnsignedScalar)).toBe(true);
    expect(supportsDataset(datasetFltScalar)).toBe(true);
    expect(supportsDataset(datasetStrScalar)).toBe(true);
    expect(supportsDataset(datasetBoolScalar)).toBe(true);
    expect(supportsDataset(datasetCplxScalar)).toBe(true);
  });

  it('should not support dataset with non-displayable type', () => {
    const dataset = makeScalarDataset('foo', compoundType);
    expect(supportsDataset(dataset)).toBe(false);
  });

  it('should not support dataset with non-scalar shape', () => {
    expect(supportsDataset(datasetInt1D)).toBe(false);
  });
});

describe('Matrix', () => {
  const { supportsDataset } = CORE_VIS.Matrix;

  it('should support array dataset with displayable type and at least one dimension', () => {
    expect(supportsDataset(datasetInt1D)).toBe(true);
    expect(supportsDataset(datasetUnsigned1D)).toBe(true);
    expect(supportsDataset(datasetStr2D)).toBe(true);
    expect(supportsDataset(datasetCplx2D)).toBe(true);
    expect(supportsDataset(datasetFlt3D)).toBe(true);
    expect(supportsDataset(datasetBool1D)).toBe(true);
  });

  it('should not support dataset with non-displayable type', () => {
    const dataset = makeDataset('foo', compoundType, [1]);
    expect(supportsDataset(dataset)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(datasetIntScalar)).toBe(false);
  });
});

describe('Line', () => {
  const { supportsDataset } = CORE_VIS.Line;

  it('should support array dataset with numeric type shape and at least one dimension', () => {
    expect(supportsDataset(datasetInt1D)).toBe(true);
    expect(supportsDataset(datasetUnsigned1D)).toBe(true);
    expect(supportsDataset(datasetFlt3D)).toBe(true);
  });

  it('should not support dataset with non-numeric type', () => {
    expect(supportsDataset(datasetStr2D)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(datasetIntScalar)).toBe(false);
  });
});

describe('Heatmap', () => {
  const { supportsDataset } = CORE_VIS.Heatmap;

  it('should support array dataset with numeric type and at least two dimensions', () => {
    expect(supportsDataset(datasetInt2D)).toBe(true);
    expect(supportsDataset(datasetUnsigned2D)).toBe(true);
    expect(supportsDataset(datasetFlt3D)).toBe(true);
  });

  it('should not support dataset with non-numeric type', () => {
    expect(supportsDataset(datasetStr2D)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(datasetIntScalar)).toBe(false);
  });

  it('should not support dataset with less than two dimensions', () => {
    expect(supportsDataset(datasetInt1D)).toBe(false);
  });
});
