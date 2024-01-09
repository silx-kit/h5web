import { range } from 'lodash';
import type { NdArray } from 'ndarray';
import ndarray from 'ndarray';

import type { ArrayValue, DType, H5WebComplex } from '../models-hdf5';

export function cplx(real: number, imag: number): H5WebComplex {
  return [real, imag];
}

const range1 = () => range(-20, 21);
const range2 = () => range(0, 100, 5);
const range3 = () => range(-1, 1.25, 0.25);
const range4 = () => range(10, 40, 10);
const range5 = () => range(1, 4);
const range6 = () => range(9335, 9338);
const range7 = () => range(0, 4);
const range8 = () => range(0, 10);
const range9 = () => range(1, 11);

const oneD = () => ndarray(range1().map((val) => val ** 2));

const oneD_bool = () =>
  ndarray([true, false, false, true, true, true, false, true, false, false]);

const oneD_cplx = () =>
  ndarray(
    range9().map((val) =>
      cplx(
        val * Math.cos((val * 3.14) / 10),
        val * Math.sin((val * 3.14) / 10),
      ),
    ),
  );

const oneD_compound = () => {
  const arrOneD = oneD();
  const arrOneDComplex = oneD_cplx();
  return ndarray(
    ['Hydrogen', 'Lithum', 'Carbon', 'Sodium', 'Argon'].map<
      [string, number, number, boolean, H5WebComplex]
    >((element, index) => [
      element,
      index,
      arrOneD.get(index),
      index % 2 === 0,
      arrOneDComplex.get(index),
    ]),
  );
};

const twoD = () => {
  const { data: dataOneD } = oneD();
  return ndarray(
    range2().flatMap((offset) => dataOneD.map((val) => val - offset)),
    [20, 41],
  );
};

const threeD = () => {
  const { data: dataTwoD } = twoD();
  return ndarray(
    range3().flatMap((multiplier) => dataTwoD.map((val) => val * multiplier)),
    [9, 20, 41],
  );
};

const threeD_rgb = () =>
  ndarray(
    [
      [
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
      ],
      [
        [0, 255, 255],
        [255, 0, 255],
        [255, 255, 0],
      ],
      [
        [0, 0, 0],
        [128, 128, 128],
        [255, 255, 255],
      ],
    ].flat(2),
    [3, 3, 3],
  );

export const mockValues = {
  oneD,
  oneD_linear: () => ndarray(range1()),
  oneD_cplx,
  oneD_compound,
  oneD_bool,
  oneD_errors: () => ndarray(oneD().data.map((val) => Math.abs(val) / 10)),
  oneD_str: () => ndarray(['foo', 'bar']),
  twoD,
  twoD_cplx: () =>
    ndarray(
      [
        [cplx(0, -5), cplx(-2.1, -2)],
        [cplx(5, 0), cplx(-3, 0.1)],
      ].flat(1),
      [2, 2],
    ),
  twoD_compound: () => {
    const arrOneD = oneD();
    const arrOneDComplex = oneD_cplx();
    return ndarray(
      [
        ...oneD_compound().data,
        ...['Vanadium', 'Niobium', 'Tantalum', 'Silicon', 'Germanium'].map<
          [string, number, number, boolean, H5WebComplex]
        >((element, index) => [
          element,
          index * 10,
          arrOneD.get(index),
          index % 2 === 1,
          arrOneDComplex.get(index),
        ]),
      ],
      [2, 5],
    );
  },
  twoD_bool: () => {
    const { data: dataOneDBool } = oneD_bool();
    return ndarray(
      dataOneDBool.flatMap((rowBool) =>
        dataOneDBool.map((colBool) => (rowBool ? colBool : !colBool)),
      ),
      [10, 10],
    );
  },
  twoD_errors: () => {
    const arr = range1();
    return ndarray(
      range2().flatMap((offset) => arr.map((val) => Math.abs(val - offset))),
      [20, 41],
    );
  },
  threeD,
  threeD_cplx: () =>
    ndarray(
      [
        [
          [cplx(2, 0), cplx(1.41, 1.41), cplx(1, 1.73), cplx(0, 2)],
          [cplx(4, 0), cplx(2.82, 2.82), cplx(2, 3.46), cplx(0, 4)],
          [cplx(1, 0), cplx(0.71, 0.71), cplx(0.5, 0.87), cplx(0, 1)],
        ],
        [
          [cplx(-1, 0), cplx(0.87, -0.5), cplx(0.92, -0.38), cplx(1, 0)],
          [cplx(-4, 0), cplx(3.46, -2), cplx(3.7, -1.53), cplx(4, 0)],
          [cplx(-8, 0), cplx(6.93, -4), cplx(7.39, -3.06), cplx(8, 0)],
        ],
      ].flat(2),
      [2, 3, 4],
    ),
  threeD_bool: () =>
    ndarray(
      [
        [
          [true, false, true, false],
          [true, true, true, true],
          [false, false, false, false],
        ],
        [
          [true, false, false, false],
          [true, true, true, true],
          [false, false, true, false],
        ],
      ].flat(2),
      [2, 3, 4],
    ),
  threeD_rgb,
  fourD: () => {
    const { data: dataThreeD } = threeD();
    return ndarray(
      range4().flatMap((divider) =>
        dataThreeD.map((val) => Math.sin(val / divider)),
      ),
      [3, 9, 20, 41],
    );
  },
  fourD_rgb: () => {
    const { data: dataRgb } = threeD_rgb();
    return ndarray(
      range8().flatMap((i) =>
        dataRgb.map((val) => Math.min(val + i * 20, 255)),
      ),
      [10, 3, 3, 3],
    );
  },
  uint8: () => ndarray(Uint8Array.from(range7()), [2, 2]),
  int16: () => ndarray(Int16Array.from(range7()), [2, 2]),
  float32: () => ndarray(Float32Array.from(range7()), [2, 2]),
  float64: () => ndarray(Float64Array.from(range7()), [2, 2]),
  int8_rgb: () =>
    ndarray(
      Int8Array.from(threeD_rgb().data.map((val) => val - 128)),
      [3, 3, 3],
    ),
  uint8_rgb: () => ndarray(Uint8Array.from(threeD_rgb().data), [3, 3, 3]),
  int32_rgb: () => ndarray(Uint32Array.from(threeD_rgb().data), [3, 3, 3]),
  float32_rgb: () =>
    ndarray(
      Float32Array.from(threeD_rgb().data.map((val) => val / 255)),
      [3, 3, 3],
    ),
  X: () => ndarray(range1()),
  X_desc: () => {
    const arr = range1();
    arr.reverse();
    return ndarray(arr);
  },
  X_log: () => ndarray(range1().map((_, i) => (i + 1) * 0.1)),
  X_rgb: () => ndarray(range5()),
  Y: () => ndarray(range2()),
  Y_desc: () => {
    const arr = range1();
    arr.reverse();
    return ndarray(arr);
  },
  Y_rgb: () => ndarray(range6()),
  secondary: () =>
    ndarray(
      twoD().data.map((v) => v * 2),
      [20, 41],
    ),
  tertiary: () =>
    ndarray(
      twoD().data.map((v) => v / 2),
      [20, 41],
    ),
  position: () => ndarray([-1, 1, 3]), // pixel boundaries (N + 1)
  scatter_data: () =>
    ndarray(range1().map((val) => Math.cos((val * 3.14) / 40))),
  Y_scatter: () =>
    ndarray(range1().map((_, i) => ((i % 10) + (i % 5)) / 123_456)),
} satisfies Record<string, () => NdArray<ArrayValue<DType>>>;
