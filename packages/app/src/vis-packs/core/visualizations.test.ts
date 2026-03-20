import { type AttributeValues, type Entity } from '@h5web/shared/hdf5-models';
import {
  arrayShape,
  boolType,
  compoundType,
  cplxType,
  floatType,
  intType,
  nullShape,
  opaqueType,
  scalarShape,
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
  get: (entity: Entity): AttributeValues => {
    return Object.fromEntries(
      entity.attributes.map((attr) => {
        assertMockAttribute(attr);
        return [attr.name, attr.value];
      }),
    );
  },
};

const nullInt = dataset('null', nullShape(), intType());

const scalarInt = dataset('int', scalarShape(), intType());
const scalarCplx = dataset('cplx', scalarShape(), cplxType(floatType()));
const scalarCompound = dataset(
  'comp',
  scalarShape(),
  compoundType([['int', intType()]]),
);
const scalarOpaque = dataset('opaque', scalarShape(), opaqueType());

const oneDInt = dataset('int_1d', arrayShape([5]), intType());
const oneDUint = dataset('uint_1d', arrayShape([5]), intType(false));
const oneDBigUint = dataset('biguint_1d', arrayShape([5]), intType(false, 64));
const oneDBool = dataset(
  'bool_1d',
  arrayShape([3]),
  boolType(intType(true, 8)),
);
const oneDCplx = dataset('cplx_1d', arrayShape([10]), cplxType(floatType()));
const oneDCompound = dataset(
  'comp_1d',
  arrayShape([5]),
  compoundType([['int', intType()]]),
);
const oneDOpaque = dataset('opaque_1d', arrayShape([5]), opaqueType());

const twoDInt = dataset('int_2d', arrayShape([5, 3]), intType());
const twoDUint = dataset('uint_2d', arrayShape([5, 3]), intType(false));
const twoDBool = dataset(
  'bool_2d',
  arrayShape([3, 2]),
  boolType(intType(true, 8)),
);
const twoDCplx = dataset('cplx_2d', arrayShape([2, 2]), cplxType(floatType()));
const twoDStr = dataset('str_2d', arrayShape([5, 3]), strType());
const twoDCompound = dataset(
  'comp_2d',
  arrayShape([5, 3]),
  compoundType([['int', intType()]]),
);

const threeDFloat = dataset('float_3d', arrayShape([5, 3, 1]), intType());
const threeDCplx = dataset(
  'cplx_3d',
  arrayShape([5, 2, 2]),
  cplxType(floatType()),
);

const imageInt3 = withImageAttr(
  dataset('image_int_3', arrayShape([256, 256, 3]), intType()),
);
const imageInt4 = withImageAttr(
  dataset('image_int_4', arrayShape([256, 256, 4]), intType()),
);
const imageInt5 = withImageAttr(
  dataset('image_int_5', arrayShape([256, 256, 5]), intType()),
);
const imageFloat3 = withImageAttr(
  dataset('image_float_3', arrayShape([256, 256, 3]), floatType()),
);
const imageStr3 = withImageAttr(
  dataset('image_str_3', arrayShape([256, 256, 3]), strType()),
);
const imageScalar = withImageAttr(
  dataset('image_scalar', scalarShape(), intType()),
);

const nestedCompound = dataset(
  'comp_nested',
  arrayShape([2]),
  compoundType([['comp', compoundType([['int', intType()]])]]),
);

describe('Raw', () => {
  const { supportsDataset } = CORE_VIS.Raw;

  it('should support dataset with non-null shape', () => {
    expect(supportsDataset(scalarInt)).toBe(true);
    expect(supportsDataset(scalarCplx)).toBe(true);
    expect(supportsDataset(scalarCompound)).toBe(true);
    expect(supportsDataset(scalarOpaque)).toBe(true);

    expect(supportsDataset(oneDBigUint)).toBe(true);
    expect(supportsDataset(oneDOpaque)).toBe(true);

    expect(supportsDataset(twoDStr)).toBe(true);
  });

  it('should not support dataset with null shape', () => {
    expect(supportsDataset(nullInt)).toBe(false);
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

describe('Complex Heatmap', () => {
  const { supportsDataset } = CORE_VIS.ComplexHeatmap;

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

describe('RGB', () => {
  const { supportsDataset } = CORE_VIS.RGB;

  it('should support array dataset with IMAGE attribute, numeric type, and last dimension of size 3 or 4', () => {
    expect(supportsDataset(imageInt3, mockStore as AttrValuesStore)).toBe(true);
    expect(supportsDataset(imageInt4, mockStore as AttrValuesStore)).toBe(true);
    expect(supportsDataset(imageFloat3, mockStore as AttrValuesStore)).toBe(
      true,
    );
  });

  it('should not support dataset with non-numeric type', () => {
    expect(supportsDataset(imageStr3, mockStore as AttrValuesStore)).toBe(
      false,
    );
  });

  it('should not support dataset with non-array shape', () => {
    expect(supportsDataset(imageScalar, mockStore as AttrValuesStore)).toBe(
      false,
    );
  });

  it('should not support dataset with last dimension of size other than 3 or 4', () => {
    expect(supportsDataset(imageInt5, mockStore as AttrValuesStore)).toBe(
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
