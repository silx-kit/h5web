import { range } from 'lodash-es';

const arr1 = range(-20, 21);
const arr2 = range(0, 100, 5);
const arr3 = range(-1, 1.25, 0.25);
const arr4 = range(10, 40, 10);

const oneD = arr1.map((val) => val ** 2);
const twoD = arr2.map((offset) => oneD.map((val) => val - offset));
const threeD = arr3.map((multiplier) =>
  twoD.map((arrOneD) => arrOneD.map((val) => val * multiplier))
);
const fourD = arr4.map((divider) =>
  threeD.map((arrTwoD) =>
    arrTwoD.map((arrOneD) => arrOneD.map((val) => Math.sin(val / divider)))
  )
);

export const mockValues = {
  null: null,
  raw: { int: 42 },
  raw_large: { str: '.'.repeat(1000) },
  scalar_int: 0,
  scalar_str: 'foo',
  scalar_bool: true,
  oneD_linear: arr1,
  oneD,
  twoD,
  twoD_spectrum: twoD,
  secondary: twoD.map((inner) => inner.map((v) => v * 2)),
  tertiary: twoD.map((inner) => inner.map((v) => v / 2)),
  threeD,
  fourD,
  X: arr1,
  Y: arr2,
  X_log: arr1.map((_, i) => (i + 1) * 0.1),
  title_twoD: 'NeXus 2D',
  oneD_str: ['foo', 'bar'],
  errors_twoD: arr2.map((offset) => arr1.map((val) => Math.abs(val - offset))),
  fourD_image: fourD,
  oneD_errors: oneD.map((x) => Math.abs(x) / 10),
  threeD_bool: [
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
  ],
  scalar_cplx: [1, 5],
  twoD_cplx: [
    [
      [0, -5],
      [-2.1, -2],
    ],
    [
      [5, 0],
      [-3, 0.1],
    ],
  ],
  threeD_cplx: [
    [
      [
        [0, 0],
        [5, 0],
        [10, 5],
        [0.1, 0.5],
      ],
      [
        [-1, -5],
        [-0.1, -0.8],
        [2, 7],
        [0.9, -5],
      ],
      [
        [0, 0],
        [5, 2],
        [0, -2],
        [-0.5, 2],
      ],
    ],
    [
      [
        [0.0001, 0],
        [0, 0.0001],
        [2, 8],
        [0.7, 0.7],
      ],
      [
        [0.5, -0.5],
        [4, 2],
        [0.4, 4.4],
        [2.3, 3.2],
      ],
      [
        [9.5, 1.4],
        [5, 0],
        [0, -2],
        [8, 2.1],
      ],
    ],
  ],
};
