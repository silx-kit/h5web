import { type Entity } from '@h5web/shared/hdf5-models';
import {
  boolType,
  compoundType,
  cplxType,
  floatType,
  intType,
  opaqueType,
  strType,
} from '@h5web/shared/hdf5-utils';
import {
  assertMockAttribute,
  dataset,
  withImageAttr,
} from '@h5web/shared/mock-utils';
import { describe, expect, it } from 'vitest';

import { type AttrValuesStore } from '../../providers/models';
import { CORE_VIS } from './visualizations';

const mockStore = {
  getSingle: (entity: Entity, attributeName: string): unknown => {
    const attr = entity.attributes.find(({ name }) => name === attributeName);
    if (!attr) {
      return undefined;
    }

    assertMockAttribute(attr);
    return attr.value;
  },
};

const nullShape = dataset('null', intType(), null);
const scalarInt = dataset('int', intType(), []);
const scalarUint = dataset('uint', intType(false), []);
const scalarBigInt = dataset('bigint', intType(true, 64), []);
const scalarFloat = dataset('float', floatType(), []);
const scalarStr = dataset('float', strType(), []);
const scalarBool = dataset('bool', boolType(intType(true, 8)), []);
const scalarCplx = dataset('cplx', cplxType(floatType()), []);
const scalarCompound = dataset('comp', compoundType({ int: intType() }), []);
const scalarOpaque = dataset('opaque', opaqueType(), []);
const oneDInt = dataset('int_1d', intType(), [5]);
const oneDUint = dataset('uint_1d', intType(false), [5]);
const oneDBigUint = dataset('biguint_1d', intType(false, 64), [5]);
const oneDBool = dataset('bool_1d', boolType(intType(true, 8)), [3]);
const oneDCplx = dataset('cplx_1d', cplxType(floatType()), [10]);
const oneDCompound = dataset('comp_1d', compoundType({ int: intType() }), [5]);
const oneDOpaque = dataset('opaque_1d', opaqueType(), [5]);
const twoDInt = dataset('int_2d', intType(), [5, 3]);
const twoDUint = dataset('uint_2d', intType(false), [5, 3]);
const twoDBool = dataset('bool_2d', boolType(intType(true, 8)), [3, 2]);
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

  it('should support any scalar dataset', () => {
    expect(supportsDataset(scalarInt)).toBe(true);
    expect(supportsDataset(scalarOpaque)).toBe(true);
  });

  it('should not support dataset with non-scalar shape', () => {
    expect(supportsDataset(nullShape)).toBe(false);
    expect(supportsDataset(oneDInt)).toBe(false);
  });
});

describe('Scalar', () => {
  const { supportsDataset } = CORE_VIS.Scalar;

  it('should support dataset with printable type and scalar shape', () => {
    expect(supportsDataset(scalarInt)).toBe(true);
    expect(supportsDataset(scalarUint)).toBe(true);
    expect(supportsDataset(scalarBigInt)).toBe(true);
    expect(supportsDataset(scalarFloat)).toBe(true);
    expect(supportsDataset(scalarStr)).toBe(true);
    expect(supportsDataset(scalarBool)).toBe(true);
    expect(supportsDataset(scalarCplx)).toBe(true);
  });

  it('should not support dataset with non-printable type', () => {
    expect(supportsDataset(scalarCompound)).toBe(false);
  });

  it('should not support dataset with non-scalar shape', () => {
    expect(supportsDataset(oneDInt)).toBe(false);
  });
});

describe('Array', () => {
  const { supportsDataset } = CORE_VIS.Array;

  it('should support any array dataset', () => {
    expect(supportsDataset(oneDBigUint)).toBe(true);
    expect(supportsDataset(oneDOpaque)).toBe(true);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(nullShape)).toBe(false);
    expect(supportsDataset(scalarUint)).toBe(false);
    expect(supportsDataset(scalarOpaque)).toBe(false);
  });
});

describe('Matrix', () => {
  const { supportsDataset } = CORE_VIS.Matrix;

  it('should support array dataset with printable type and at least one dimension', () => {
    expect(supportsDataset(oneDInt)).toBe(true);
    expect(supportsDataset(oneDUint)).toBe(true);
    expect(supportsDataset(oneDBigUint)).toBe(true);
    expect(supportsDataset(twoDStr)).toBe(true);
    expect(supportsDataset(twoDCplx)).toBe(true);
    expect(supportsDataset(threeDFloat)).toBe(true);
    expect(supportsDataset(oneDBool)).toBe(true);
  });

  it('should not support dataset with non-printable type', () => {
    expect(supportsDataset(oneDCompound)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarInt)).toBe(false);
  });
});

describe('Line', () => {
  const { supportsDataset } = CORE_VIS.Line;

  it('should support array dataset with numeric-like type and at least one dimension', () => {
    expect(supportsDataset(oneDInt)).toBe(true);
    expect(supportsDataset(oneDUint)).toBe(true);
    expect(supportsDataset(oneDBigUint)).toBe(true);
    expect(supportsDataset(oneDBool)).toBe(true);
    expect(supportsDataset(twoDBool)).toBe(true);
    expect(supportsDataset(threeDFloat)).toBe(true);
  });

  it('should not support dataset with non-numeric-like type', () => {
    expect(supportsDataset(twoDStr)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarInt)).toBe(false);
  });
});

describe('Heatmap', () => {
  const { supportsDataset } = CORE_VIS.Heatmap;

  it('should support array dataset with numeric-like type and at least two dimensions', () => {
    expect(supportsDataset(twoDInt)).toBe(true);
    expect(supportsDataset(twoDUint)).toBe(true);
    expect(supportsDataset(twoDBool)).toBe(true);
    expect(supportsDataset(threeDFloat)).toBe(true);
  });

  it('should not support dataset with non-numeric-like type', () => {
    expect(supportsDataset(twoDStr)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarInt)).toBe(false);
  });

  it('should not support dataset with less than two dimensions', () => {
    expect(supportsDataset(oneDInt)).toBe(false);
  });
});

describe('Complex', () => {
  const { supportsDataset } = CORE_VIS.Complex;

  it('should support array dataset with complex type and at least two dimensions', () => {
    expect(supportsDataset(twoDCplx)).toBe(true);
    expect(supportsDataset(threeDCplx)).toBe(true);
  });

  it('should not support dataset with non-complex type', () => {
    expect(supportsDataset(twoDUint)).toBe(false);
    expect(supportsDataset(twoDInt)).toBe(false);
    expect(supportsDataset(threeDFloat)).toBe(false);
    expect(supportsDataset(twoDStr)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarCplx)).toBe(false);
  });

  it('should not support dataset with less than two dimensions', () => {
    expect(supportsDataset(oneDCplx)).toBe(false);
  });
});

describe('Complex Line', () => {
  const { supportsDataset } = CORE_VIS.ComplexLine;

  it('should support array dataset with complex type and at least one dimension', () => {
    expect(supportsDataset(oneDCplx)).toBe(true);
  });

  it('should not support dataset with non-complex type', () => {
    expect(supportsDataset(twoDInt)).toBe(false);
    expect(supportsDataset(oneDUint)).toBe(false);
    expect(supportsDataset(twoDStr)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(scalarCplx)).toBe(false);
  });
});

describe('RGB', () => {
  const { supportsDataset } = CORE_VIS.RGB;

  it('should support array dataset with IMAGE attribute and numeric type', () => {
    expect(supportsDataset(image, mockStore as AttrValuesStore)).toBe(true);
    expect(supportsDataset(imageFloat, mockStore as AttrValuesStore)).toBe(
      true,
    );
  });

  it('should not support dataset with non-numeric type', () => {
    expect(supportsDataset(imageStr, mockStore as AttrValuesStore)).toBe(false);
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(imageScalar, mockStore as AttrValuesStore)).toBe(
      false,
    );
  });
});

describe('Compound', () => {
  const { supportsDataset } = CORE_VIS.Compound;

  it('should support scalar dataset with printable compound type', () => {
    expect(supportsDataset(scalarCompound)).toBe(true);
  });

  it('should support array dataset with printable compound type and at least one dimension', () => {
    expect(supportsDataset(oneDCompound)).toBe(true);
    expect(supportsDataset(twoDCompound)).toBe(true);
  });

  it('should not support dataset with non-compound type or non-printable compound type', () => {
    expect(supportsDataset(oneDInt)).toBe(false);
    expect(supportsDataset(nestedCompound)).toBe(false);
  });
});
