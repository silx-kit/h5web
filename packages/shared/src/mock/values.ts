import { range } from 'lodash';

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

const typed = [0, 1, 2, 3];
const rgb = [
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
];

const rgbFlat = rgb.flat(Infinity) as number[];

const oneD_cplx = range(1, 11).map((val) => [
  val * Math.cos((val * 3.14) / 10),
  val * Math.sin((val * 3.14) / 10),
]);

export const mockValues = {
  null: null,
  raw: { int: 42 },
  raw_large: { str: '.'.repeat(1000) },
  scalar_int: 0,
  scalar_int_42: 42,
  scalar_str: 'foo',
  scalar_bool: true,
  scalar_cplx: [1, 5],
  oneD,
  oneD_cplx,
  oneD_linear: arr1,
  oneD_errors: oneD.map((x) => Math.abs(x) / 10),
  oneD_str: ['foo', 'bar'],
  twoD,
  twoD_errors: arr2.map((offset) => arr1.map((val) => Math.abs(val - offset))),
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
  threeD,
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
  threeD_cplx: [
    [
      [
        [2, 0],
        [1.41, 1.41],
        [1, 1.73],
        [0, 2],
      ],
      [
        [4, 0],
        [2.82, 2.82],
        [2, 3.46],
        [0, 4],
      ],
      [
        [1, 0],
        [0.71, 0.71],
        [0.5, 0.87],
        [0, 1],
      ],
    ],
    [
      [
        [-1, 0],
        [0.87, -0.5],
        [0.92, -0.38],
        [1, 0],
      ],
      [
        [-4, 0],
        [3.46, -2],
        [3.7, -1.53],
        [4, 0],
      ],
      [
        [-8, 0],
        [6.93, -4],
        [7.39, -3.06],
        [8, 0],
      ],
    ],
  ],
  threeD_rgb: rgb,
  fourD,
  uint8: Uint8Array.from(typed),
  int16: Int16Array.from(typed),
  float32: Float32Array.from(typed),
  float64: Float64Array.from(typed),
  int8_rgb: Int8Array.from(rgbFlat.map((val) => val - 128)),
  uint8_rgb: Uint8Array.from(rgbFlat),
  int32_rgb: Uint32Array.from(rgbFlat),
  float32_rgb: Float32Array.from(rgbFlat.map((val) => val / 255)),
  X: arr1,
  X_desc: [...arr1].reverse(),
  X_log: arr1.map((_, i) => (i + 1) * 0.1),
  Y: arr2,
  Y_desc: [...arr2].reverse(),
  title_twoD: 'NeXus 2D',
  secondary: twoD.map((inner) => inner.map((v) => v * 2)),
  tertiary: twoD.map((inner) => inner.map((v) => v / 2)),
  position: [-1, 1],
  scatter_data: arr1.map((val) => Math.cos((val * 3.14) / 40)),
  Y_scatter: arr1.map((v, i) => (i % 10) + (i % 5)),
  oneD_compound: ['Hydrogen', 'Lithum', 'Carbon', 'Sodium', 'Argon'].map(
    (v, i) => [v, i, oneD[i], i % 2 === 0, oneD_cplx[i]]
  ),
};
