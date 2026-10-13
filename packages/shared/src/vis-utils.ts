import { format } from 'd3-format';
import ndarray, { type NdArray } from 'ndarray';

import { assertLength, isNdArray, isTypedArray } from './guards';
import {
  type ArrayValue,
  type BooleanType,
  type ComplexType,
  type EnumType,
  type ScalarValue,
} from './hdf5-models';
import {
  type AnyNumArray,
  type Bounds,
  type Domain,
  type IgnoreValue,
  type NumArray,
  ScaleType,
  type TypedArrayConstructor,
} from './vis-models';

export const SCALAR_SELECTION_REGEXP = /^\d+(?:,\d+)*$/u;

export const formatBound = format('.3~e');
export const formatBoundInput = format('.5~e');
export const formatTooltipVal = format('.5~g');
export const formatTooltipErr = format('.3~g');
export const formatScalarComplex = createComplexFormatter(format('.12~g'));

const TICK_PRECISION = 3;
const TICK_DECIMAL_REGEX = /0\.(\d+)$/u; // can start with minus sign
const formatTickAuto = format(`.${TICK_PRECISION}~g`); // automatic mode (`Number.toPrecision`)
const formatTickExp = format(`.${TICK_PRECISION}~e`); // exponent mode

export function formatTick(val: number | { valueOf: () => number }): string {
  const str = formatTickAuto(val);

  /* If automatic mode gives a decimal number with more than three decimals,
   * force exponent notation - e.g. 0.00000123456 => 0.00000123 => 1.235e-6 */
  const match = TICK_DECIMAL_REGEX.exec(str);
  if (match && match[1].length > TICK_PRECISION) {
    return formatTickExp(val);
  }

  return str;
}

export function formatBool(value: ScalarValue<BooleanType>): string {
  return (typeof value === 'number' ? !!value : value).toString();
}

export function createComplexFormatter(
  formatReal: (val: number) => string,
  formatImag = formatReal,
): (val: ScalarValue<ComplexType>) => string {
  return (value) => {
    const [real, imag] = value;
    const sign = Math.sign(imag) >= 0 ? ' + ' : ' − ';
    return `${formatReal(real)}${sign}${formatImag(Math.abs(imag))} i`;
  };
}

export function createEnumFormatter(
  mapping: Record<number, string>,
): (val: ScalarValue<EnumType>) => string {
  return (value) => (value in mapping ? mapping[value] : value.toString());
}

export function formatRaw(value: unknown): string {
  if (isTypedArray(value)) {
    return `${value.constructor.name} [ ${value.toString()} ]`;
  }

  return JSON.stringify(value, null, 2);
}

export function getValues(arr: AnyNumArray): NumArray {
  return isNdArray(arr) ? arr.data : arr;
}

export function toTypedNdArray<T extends TypedArrayConstructor>(
  arr: NdArray<NumArray>,
  Constructor: T,
): NdArray<InstanceType<T>> {
  return ndarray(Constructor.from(arr.data) as InstanceType<T>, arr.shape);
}

type ElementView = Uint8Array | Uint16Array | Uint32Array | Float64Array;

type RowCopier<A> = (
  src: A,
  dst: A,
  srcStart: number,
  dstStart: number,
  len: number,
  srcStride: number,
) => void;

/* eslint-disable func-style, no-param-reassign */
// One function per element type, so element accesses remain monomorphic
const copyRow: RowCopier<unknown[]> = (src, dst, k, i, len, step) => {
  for (const end = i + len; i < end; i += 1, k += step) {
    dst[i] = src[k];
  }
};
const copyRow8: RowCopier<Uint8Array> = (src, dst, k, i, len, step) => {
  for (const end = i + len; i < end; i += 1, k += step) {
    dst[i] = src[k];
  }
};
const copyRow16: RowCopier<Uint16Array> = (src, dst, k, i, len, step) => {
  for (const end = i + len; i < end; i += 1, k += step) {
    dst[i] = src[k];
  }
};
const copyRow32: RowCopier<Uint32Array> = (src, dst, k, i, len, step) => {
  for (const end = i + len; i < end; i += 1, k += step) {
    dst[i] = src[k];
  }
};
const copyRow64: RowCopier<Float64Array> = (src, dst, k, i, len, step) => {
  for (const end = i + len; i < end; i += 1, k += step) {
    dst[i] = src[k];
  }
};
const copyRowNative: RowCopier<ElementView> = (src, dst, k, i, len) => {
  dst.set(src.subarray(k, k + len), i);
};
const copyRowReversed: RowCopier<ElementView> = (src, dst, k, i, len) => {
  dst.set(src.subarray(k - len + 1, k + 1), i);
  dst.subarray(i, i + len).reverse();
};
/* eslint-enable func-style, no-param-reassign */

// Typed arrays are copied through views with the same element size
const ROW_COPIERS = {
  1: [Uint8Array, copyRow8],
  2: [Uint16Array, copyRow16],
  4: [Uint32Array, copyRow32],
  8: [Float64Array, copyRow64],
} as const;

const COPY_TILE_SIZE = 64;

export function createArrayFromView<T extends ArrayValue>(
  view: NdArray<T>,
): NdArray<T> {
  const { data, size, shape, stride, offset } = view;

  // Ignore dimensions of length 1, since they don't affect iteration order
  const dims = shape.flatMap((len, i) => (len > 1 ? [i] : []));
  const lens = dims.map((i) => shape[i]);
  const strides = dims.map((i) => stride[i]);

  // Fast path: view is contiguous in C order, so copy its data in one go
  if (size === 0 || isCOrderContiguous(lens, strides)) {
    const [start, end] = [offset, offset + size];
    return ndarray(
      (Array.isArray(data)
        ? data.slice(start, end)
        : // Not `slice`, which doesn't copy Node.js buffers
          new (data.constructor as TypedArrayConstructor)(
            (data as Float64Array).subarray(start, end),
          )) as T,
      shape,
    );
  }

  const array = (
    Array.isArray(data)
      ? Array.from({ length: size })
      : new (data.constructor as TypedArrayConstructor)(size)
  ) as T;

  // BigInt values can't go through a numeric view, so copy them generically
  if (
    Array.isArray(data) ||
    data instanceof BigInt64Array ||
    data instanceof BigUint64Array
  ) {
    const [src, dst] = [data, array] as unknown as unknown[][];
    copyStrided(copyRow, src, dst, lens, strides, offset);
  } else {
    const [src, dst] = [data, array] as unknown as Float64Array<ArrayBuffer>[];
    const [View, copier] = ROW_COPIERS[src.BYTES_PER_ELEMENT as 1 | 2 | 4 | 8];
    const innerStride = strides[strides.length - 1];

    copyStrided<ElementView>(
      innerStride === 1
        ? copyRowNative
        : innerStride === -1
          ? copyRowReversed
          : (copier as RowCopier<ElementView>),
      new View(src.buffer, src.byteOffset, src.length),
      new View(dst.buffer),
      lens,
      strides,
      offset,
    );
  }

  return ndarray(array, shape);
}

function isCOrderContiguous(lens: number[], strides: number[]): boolean {
  let expectedStride = 1;

  for (let dim = lens.length - 1; dim >= 0; dim -= 1) {
    if (strides[dim] !== expectedStride) {
      return false;
    }
    expectedStride *= lens[dim];
  }

  return true;
}

function copyStrided<A>(
  copier: RowCopier<A>,
  src: A,
  dst: A,
  lens: number[],
  srcStrides: number[],
  srcOffset: number,
): void {
  // Output is contiguous in C order
  const dstStrides = lens.map((_, dim) =>
    lens.slice(dim + 1).reduce((acc, len) => acc * len, 1),
  );

  // Copy rows along innermost output dimension `a`; if the source is faster
  // along another dimension `p`, copy in tiles over both to stay cache-friendly
  const a = lens.length - 1;
  let p = -1;
  for (let dim = 0; dim < a; dim += 1) {
    const s = Math.abs(srcStrides[dim]);
    if (s > 0 && s < Math.abs(srcStrides[p < 0 ? a : p])) {
      p = dim;
    }
  }

  const [lenA, srcStrideA] = [lens[a], srcStrides[a]];
  const [lenP, srcStrideP, dstStrideP] =
    p < 0 ? [1, 0, 0] : [lens[p], srcStrides[p], dstStrides[p]];
  const tileA = p < 0 ? lenA : COPY_TILE_SIZE;
  const tileP = p < 0 ? 1 : COPY_TILE_SIZE;

  // Iterate over remaining dimensions recursively, then copy tiles of rows
  const outerDims = lens.flatMap((_, dim) =>
    dim === a || dim === p ? [] : [dim],
  );

  function copyFrom(level: number, srcBase: number, dstBase: number): void {
    if (level < outerDims.length) {
      const dim = outerDims[level];
      for (let i = 0; i < lens[dim]; i += 1) {
        const srcStart = srcBase + i * srcStrides[dim];
        copyFrom(level + 1, srcStart, dstBase + i * dstStrides[dim]);
      }
      return;
    }

    for (let p0 = 0; p0 < lenP; p0 += tileP) {
      const pEnd = Math.min(p0 + tileP, lenP);

      for (let a0 = 0; a0 < lenA; a0 += tileA) {
        const len = Math.min(tileA, lenA - a0);

        for (let ip = p0; ip < pEnd; ip += 1) {
          const srcStart = srcBase + ip * srcStrideP + a0 * srcStrideA;
          const dstStart = dstBase + ip * dstStrideP + a0;
          copier(src, dst, srcStart, dstStart, len, srcStrideA);
        }
      }
    }
  }

  copyFrom(0, srcOffset, 0);
}

const INITIAL_BOUNDS = {
  min: Infinity,
  max: -Infinity,
  positiveMin: Infinity,
  strictPositiveMin: Infinity,
};

/* eslint-disable no-param-reassign */
function mutateBounds(bounds: Bounds, value: number): void {
  const { min, max, positiveMin, strictPositiveMin } = bounds;

  bounds.min = Math.min(value, min);
  bounds.max = Math.max(value, max);
  bounds.positiveMin = value >= 0 ? Math.min(value, positiveMin) : positiveMin;
  bounds.strictPositiveMin =
    value > 0 ? Math.min(value, strictPositiveMin) : strictPositiveMin;
}
/* eslint-enable no-param-reassign */

export function getBounds(
  valuesArray: AnyNumArray,
  ignoreValue?: IgnoreValue,
): Bounds | undefined {
  const values = getValues(valuesArray);
  const valuesBounds = { ...INITIAL_BOUNDS };

  // eslint-disable-next-line @typescript-eslint/prefer-for-of,unicorn/no-for-loop -- classic for loop is more efficient
  for (let i = 0; i < values.length; i += 1) {
    const val = values[i];
    if (Number.isFinite(val) && !ignoreValue?.(val)) {
      mutateBounds(valuesBounds, val);
    }
  }

  // Return `undefined` bounds if min is still Infinity (i.e. no values or only NaN/Infinity)
  return Number.isFinite(valuesBounds.min) ? valuesBounds : undefined;
}

export function getBoundsWithErrors(
  valuesArray: AnyNumArray,
  errorsArray: AnyNumArray | undefined,
  ignoreValue?: IgnoreValue,
): [
  boundsWithErrors: Bounds | undefined,
  boundsWithoutErrors: Bounds | undefined,
] {
  const values = getValues(valuesArray);
  const errors = errorsArray && getValues(errorsArray);
  assertLength(errorsArray, values.length, 'error');

  const boundsWithErrors = { ...INITIAL_BOUNDS };
  const boundsWithoutErrors = { ...INITIAL_BOUNDS };

  // eslint-disable-next-line unicorn/no-for-loop -- classic for loop is more efficient
  for (let i = 0; i < values.length; i += 1) {
    const val = values[i];
    if (!Number.isFinite(val) || ignoreValue?.(val)) {
      continue;
    }

    mutateBounds(boundsWithErrors, val);
    mutateBounds(boundsWithoutErrors, val);

    const err = errors?.[i];
    if (err !== undefined && Number.isFinite(err)) {
      mutateBounds(boundsWithErrors, val - err);
      mutateBounds(boundsWithErrors, val + err);
    }
  }

  // Return `undefined` bounds if min is still Infinity (i.e. no values or only NaN/Infinity)
  return [
    Number.isFinite(boundsWithErrors.min) ? boundsWithErrors : undefined,
    Number.isFinite(boundsWithoutErrors.min) ? boundsWithoutErrors : undefined,
  ];
}

export function getValidDomainForScale(
  bounds: Bounds | undefined,
  scaleType: ScaleType,
): Domain | undefined {
  if (bounds === undefined) {
    return undefined;
  }

  const { min, max, positiveMin, strictPositiveMin } = bounds;

  if (scaleType === ScaleType.Log && min <= 0) {
    return Number.isFinite(strictPositiveMin)
      ? [strictPositiveMin, max] // clamp min to first strictly positive value, if any
      : undefined; // can't make valid domain - e.g. [-5, -2], [-10, 0]
  }

  if (scaleType === ScaleType.Sqrt && min < 0) {
    return Number.isFinite(positiveMin)
      ? [positiveMin, max] // clamp min to first positive value, if any
      : undefined; // can't make valid domain - e.g. [-5, -2]
  }

  return [min, max];
}

export function castArray<T>(arrOrVal: T[] | T): T[] {
  return Array.isArray(arrOrVal) ? arrOrVal : [arrOrVal];
}
