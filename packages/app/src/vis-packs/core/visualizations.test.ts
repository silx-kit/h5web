import { type Entity } from '@h5web/shared/hdf5-models';
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

import { type DataContextValue } from '../../providers/DataProvider';
import { CORE_VIS } from './visualizations';

const mockDataContext = {
  queries: { attrValues: (entity: Entity): Entity => entity },
  queryClient: {
    query: async (entity: Entity) => {
      return Object.fromEntries(
        entity.attributes.map((attr) => {
          assertMockAttribute(attr);
          return [attr.name, attr.value];
        }),
      );
    },
  },
} as unknown as DataContextValue;

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

describe('Scalar', () => {
  const { supportsDataset } = CORE_VIS.Scalar;

  it('should support dataset with non-null shape', async () => {
    await expect(supportsDataset(scalarInt)).resolves.toBe(true);
    await expect(supportsDataset(scalarCplx)).resolves.toBe(true);
    await expect(supportsDataset(scalarCompound)).resolves.toBe(true);
    await expect(supportsDataset(scalarOpaque)).resolves.toBe(true);

    await expect(supportsDataset(oneDBigUint)).resolves.toBe(true);
    await expect(supportsDataset(oneDOpaque)).resolves.toBe(true);

    await expect(supportsDataset(twoDStr)).resolves.toBe(true);
  });

  it('should not support dataset with null shape', async () => {
    await expect(supportsDataset(nullInt)).resolves.toBe(false);
  });
});

describe('Matrix', () => {
  const { supportsDataset } = CORE_VIS.Matrix;

  it('should support array dataset with printable type and at least one dimension', async () => {
    await expect(supportsDataset(oneDInt)).resolves.toBe(true);
    await expect(supportsDataset(oneDUint)).resolves.toBe(true);
    await expect(supportsDataset(oneDBigUint)).resolves.toBe(true);
    await expect(supportsDataset(twoDStr)).resolves.toBe(true);
    await expect(supportsDataset(twoDCplx)).resolves.toBe(true);
    await expect(supportsDataset(threeDFloat)).resolves.toBe(true);
    await expect(supportsDataset(oneDBool)).resolves.toBe(true);
  });

  it('should not support dataset with non-printable type', async () => {
    await expect(supportsDataset(oneDCompound)).resolves.toBe(false);
  });

  it('should not support dataset with non-array shape', async () => {
    await expect(supportsDataset(scalarInt)).resolves.toBe(false);
  });
});

describe('Line', () => {
  const { supportsDataset } = CORE_VIS.Line;

  it('should support array dataset with numeric-like type and at least one dimension', async () => {
    await expect(supportsDataset(oneDInt)).resolves.toBe(true);
    await expect(supportsDataset(oneDUint)).resolves.toBe(true);
    await expect(supportsDataset(oneDBigUint)).resolves.toBe(true);
    await expect(supportsDataset(oneDBool)).resolves.toBe(true);
    await expect(supportsDataset(twoDBool)).resolves.toBe(true);
    await expect(supportsDataset(threeDFloat)).resolves.toBe(true);
  });

  it('should not support dataset with non-numeric-like type', async () => {
    await expect(supportsDataset(twoDStr)).resolves.toBe(false);
  });

  it('should not support dataset with non-array shape', async () => {
    await expect(supportsDataset(scalarInt)).resolves.toBe(false);
  });
});

describe('Complex Line', () => {
  const { supportsDataset } = CORE_VIS.ComplexLine;

  it('should support array dataset with complex type and at least one dimension', async () => {
    await expect(supportsDataset(oneDCplx)).resolves.toBe(true);
  });

  it('should not support dataset with non-complex type', async () => {
    await expect(supportsDataset(twoDInt)).resolves.toBe(false);
    await expect(supportsDataset(oneDUint)).resolves.toBe(false);
    await expect(supportsDataset(twoDStr)).resolves.toBe(false);
  });

  it('should not support dataset with non-array shape', async () => {
    await expect(supportsDataset(scalarCplx)).resolves.toBe(false);
  });
});

describe('Heatmap', () => {
  const { supportsDataset } = CORE_VIS.Heatmap;

  it('should support array dataset with numeric-like type and at least two dimensions', async () => {
    await expect(supportsDataset(twoDInt)).resolves.toBe(true);
    await expect(supportsDataset(twoDUint)).resolves.toBe(true);
    await expect(supportsDataset(twoDBool)).resolves.toBe(true);
    await expect(supportsDataset(threeDFloat)).resolves.toBe(true);
  });

  it('should not support dataset with non-numeric-like type', async () => {
    await expect(supportsDataset(twoDStr)).resolves.toBe(false);
  });

  it('should not support dataset with non-array shape', async () => {
    await expect(supportsDataset(scalarInt)).resolves.toBe(false);
  });

  it('should not support dataset with less than two dimensions', async () => {
    await expect(supportsDataset(oneDInt)).resolves.toBe(false);
  });
});

describe('Complex Heatmap', () => {
  const { supportsDataset } = CORE_VIS.ComplexHeatmap;

  it('should support array dataset with complex type and at least two dimensions', async () => {
    await expect(supportsDataset(twoDCplx)).resolves.toBe(true);
    await expect(supportsDataset(threeDCplx)).resolves.toBe(true);
  });

  it('should not support dataset with non-complex type', async () => {
    await expect(supportsDataset(twoDUint)).resolves.toBe(false);
    await expect(supportsDataset(twoDInt)).resolves.toBe(false);
    await expect(supportsDataset(threeDFloat)).resolves.toBe(false);
    await expect(supportsDataset(twoDStr)).resolves.toBe(false);
  });

  it('should not support dataset with non-array shape', async () => {
    await expect(supportsDataset(scalarCplx)).resolves.toBe(false);
  });

  it('should not support dataset with less than two dimensions', async () => {
    await expect(supportsDataset(oneDCplx)).resolves.toBe(false);
  });
});

describe('RGB', () => {
  const { supportsDataset } = CORE_VIS.RGB;

  it('should support array dataset with IMAGE attribute, numeric type, and last dimension of size 3 or 4', async () => {
    await expect(supportsDataset(imageInt3, mockDataContext)).resolves.toBe(
      true,
    );
    await expect(supportsDataset(imageInt4, mockDataContext)).resolves.toBe(
      true,
    );
    await expect(supportsDataset(imageFloat3, mockDataContext)).resolves.toBe(
      true,
    );
  });

  it('should not support dataset with non-numeric type', async () => {
    await expect(supportsDataset(imageStr3, mockDataContext)).resolves.toBe(
      false,
    );
  });

  it('should not support dataset with non-array shape', async () => {
    await expect(supportsDataset(imageScalar, mockDataContext)).resolves.toBe(
      false,
    );
  });

  it('should not support dataset with last dimension of size other than 3 or 4', async () => {
    await expect(supportsDataset(imageInt5, mockDataContext)).resolves.toBe(
      false,
    );
  });
});

describe('Compound', () => {
  const { supportsDataset } = CORE_VIS.Compound;

  it('should support scalar dataset with printable compound type', async () => {
    await expect(supportsDataset(scalarCompound)).resolves.toBe(true);
  });

  it('should support array dataset with printable compound type and at least one dimension', async () => {
    await expect(supportsDataset(oneDCompound)).resolves.toBe(true);
    await expect(supportsDataset(twoDCompound)).resolves.toBe(true);
  });

  it('should not support dataset with non-compound type or non-printable compound type', async () => {
    await expect(supportsDataset(oneDInt)).resolves.toBe(false);
    await expect(supportsDataset(nestedCompound)).resolves.toBe(false);
  });
});
