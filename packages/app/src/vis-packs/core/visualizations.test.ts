import type { Entity } from '@h5web/shared/hdf5-models';
import {
  boolType,
  compoundType,
  cplxType,
  floatType,
  intType,
  strType,
  uintType,
} from '@h5web/shared/hdf5-utils';
import {
  assertMockAttribute,
  dataset,
  withImageAttr,
} from '@h5web/shared/mock-utils';

import type { AttrValuesStore } from '../../providers/models';
import { CORE_VIS } from './visualizations';

const mockStore = {
  getSingle: (entity: Entity, attributeName: string): unknown => {
    const attr = entity.attributes?.find(({ name }) => name === attributeName);
    if (!attr) {
      return undefined;
    }

    assertMockAttribute(attr);
    return attr.value;
  },
} as AttrValuesStore;

const scalarInt = dataset('int', intType(), []);
const scalarUint = dataset('uint', uintType(), []);
const scalarFloat = dataset('float', floatType(), []);
const scalarStr = dataset('float', strType(), []);
const scalarBool = dataset('bool', boolType(), []);
const scalarCplx = dataset('cplx', cplxType(floatType()), []);
const scalarCompound = dataset('comp', compoundType({ int: intType() }), []);
const oneDInt = dataset('int_1d', intType(), [5]);
const oneDUint = dataset('uint_1d', uintType(), [5]);
const oneDBool = dataset('bool_1d', boolType(), [3]);
const oneDCplx = dataset('cplx_1d', cplxType(floatType()), [10]);
const oneDCompound = dataset('comp_1d', compoundType({ int: intType() }), [5]);
const twoDInt = dataset('int_2d', intType(), [5, 3]);
const twoDUint = dataset('uint_2d', uintType(), [5, 3]);
const twoDBool = dataset('bool_2d', boolType(), [3, 2]);
const twoDCplx = dataset('cplx_2d', cplxType(floatType()), [2, 2]);
const twoDStr = dataset('str_2d', strType(), [5, 3]);
const threeDFloat = dataset('float_3d', intType(), [5, 3, 1]);
const threeDCplx = dataset('cplx_3d', cplxType(floatType()), [5, 2, 2]);
const twoDCompound = dataset(
  'comp_2d',
  compoundType({ int: intType() }),
  [5, 3],
);

const image = withImageAttr(dataset('image', intType(), [256, 256, 3]));
const imageFloat = withImageAttr(
  dataset('image_float', floatType(), [256, 256, 3]),
);
const imageStr = withImageAttr(dataset('image_str', strType(), [256, 256, 3]));
const imageScalar = withImageAttr(dataset('image_scalar', intType(), []));

const nestedCompound = dataset(
  'comp_nested',
  compoundType({ comp: compoundType({ int: intType() }) }),
  [2],
);

describe('Raw', () => {
  const { supportsDataset } = CORE_VIS.Raw;

  it('should support any dataset', () => {
    expect(supportsDataset(scalarInt, mockStore)).toBe(true);
    expect(supportsDataset(twoDStr, mockStore)).toBe(true);
  });
});

describe('Scalar', () => {
  const { supportsDataset } = CORE_VIS.Scalar;

  it('should support dataset with printable type and scalar shape', () => {
    expect(supportsDataset(scalarInt, mockStore)).toBe(true);
    expect(supportsDataset(scalarUint, mockStore)).toBe(true);
    expect(supportsDataset(scalarFloat, mockStore)).toBe(true);
    expect(supportsDataset(scalarStr, mockStore)).toBe(true);
    expect(supportsDataset(scalarBool, mockStore)).toBe(true);
    expect(supportsDataset(scalarCplx, mockStore)).toBe(true);
  });

  it('should not support dataset with non-printable type', () => {
    expect(supportsDataset(scalarCompound, mockStore)).toBe(false);
  });

  it('should not support dataset with non-scalar shape', () => {
    expect(supportsDataset(oneDInt, mockStore)).toBe(false);
  });
});

describe('Matrix', () => {
  const { supportsDataset } = CORE_VIS.Matrix;

  it('should support array dataset with printable type and at least one dimension', () => {
    expect(supportsDataset(oneDInt, mockStore)).toBe(true);
    expect(supportsDataset(oneDUint, mockStore)).toBe(true);
    expect(supportsDataset(twoDStr, mockStore)).toBe(true);
    expect(supportsDataset(twoDCplx, mockStore)).toBe(true);
    expect(supportsDataset(threeDFloat, mockStore)).toBe(true);
    expect(supportsDataset(oneDBool, mockStore)).toBe(true);
  });

  it('should not support dataset with non-printable type', () => {
    expect(supportsDataset(oneDCompound, mockStore)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarInt, mockStore)).toBe(false);
  });
});

describe('Line', () => {
  const { supportsDataset } = CORE_VIS.Line;

  it('should support array dataset with numeric-like type and at least one dimension', () => {
    expect(supportsDataset(oneDInt, mockStore)).toBe(true);
    expect(supportsDataset(oneDUint, mockStore)).toBe(true);
    expect(supportsDataset(oneDBool, mockStore)).toBe(true);
    expect(supportsDataset(twoDBool, mockStore)).toBe(true);
    expect(supportsDataset(threeDFloat, mockStore)).toBe(true);
  });

  it('should not support dataset with non-numeric-like type', () => {
    expect(supportsDataset(twoDStr, mockStore)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarInt, mockStore)).toBe(false);
  });
});

describe('Heatmap', () => {
  const { supportsDataset } = CORE_VIS.Heatmap;

  it('should support array dataset with numeric-like type and at least two dimensions', () => {
    expect(supportsDataset(twoDInt, mockStore)).toBe(true);
    expect(supportsDataset(twoDUint, mockStore)).toBe(true);
    expect(supportsDataset(twoDBool, mockStore)).toBe(true);
    expect(supportsDataset(threeDFloat, mockStore)).toBe(true);
  });

  it('should not support dataset with non-numeric-like type', () => {
    expect(supportsDataset(twoDStr, mockStore)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarInt, mockStore)).toBe(false);
  });

  it('should not support dataset with less than two dimensions', () => {
    expect(supportsDataset(oneDInt, mockStore)).toBe(false);
  });
});

describe('Complex', () => {
  const { supportsDataset } = CORE_VIS.Complex;

  it('should support array dataset with complex type and at least two dimensions', () => {
    expect(supportsDataset(twoDCplx, mockStore)).toBe(true);
    expect(supportsDataset(threeDCplx, mockStore)).toBe(true);
  });

  it('should not support dataset with non-complex type', () => {
    expect(supportsDataset(twoDUint, mockStore)).toBe(false);
    expect(supportsDataset(twoDInt, mockStore)).toBe(false);
    expect(supportsDataset(threeDFloat, mockStore)).toBe(false);
    expect(supportsDataset(twoDStr, mockStore)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarCplx, mockStore)).toBe(false);
  });

  it('should not support dataset with less than two dimensions', () => {
    expect(supportsDataset(oneDCplx, mockStore)).toBe(false);
  });
});

describe('Complex Line', () => {
  const { supportsDataset } = CORE_VIS.ComplexLine;

  it('should support array dataset with complex type and at least one dimension', () => {
    expect(supportsDataset(oneDCplx, mockStore)).toBe(true);
  });

  it('should not support dataset with non-complex type', () => {
    expect(supportsDataset(twoDInt, mockStore)).toBe(false);
    expect(supportsDataset(oneDUint, mockStore)).toBe(false);
    expect(supportsDataset(twoDStr, mockStore)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarCplx, mockStore)).toBe(false);
  });
});

describe('RGB', () => {
  const { supportsDataset } = CORE_VIS.RGB;

  it('should support array dataset with IMAGE attribute and numeric type', () => {
    expect(supportsDataset(image, mockStore)).toBe(true);
    expect(supportsDataset(imageFloat, mockStore)).toBe(true);
  });

  it('should not support dataset with non-numeric type', () => {
    expect(supportsDataset(imageStr, mockStore)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(imageScalar, mockStore)).toBe(false);
  });
});

describe('Compound Matrix', () => {
  const { supportsDataset } = CORE_VIS.CompoundMatrix;

  it('should support array dataset with printable compound type and at least one dimension', () => {
    expect(supportsDataset(oneDCompound, mockStore)).toBe(true);
    expect(supportsDataset(twoDCompound, mockStore)).toBe(true);
  });

  it('should not support dataset with non-compound type or non-printable compound type', () => {
    expect(supportsDataset(oneDInt, mockStore)).toBe(false);
    expect(supportsDataset(nestedCompound, mockStore)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarCompound, mockStore)).toBe(false);
  });
});
