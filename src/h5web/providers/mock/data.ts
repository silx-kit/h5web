import { range } from 'lodash-es';
import { ScaleType } from '../../visualizations/shared/models';
import {
  makeMyDataset,
  makeMyDatatype,
  makeMyExternalLink,
  makeMyGroup,
  makeMyNxDataGroup,
  makeMyNxDataset,
  makeMyNxEntityGroup,
  makeMySimpleDataset,
} from '../my-utils';
import {
  compoundType,
  floatType,
  intType,
  makeAttr,
  makeStrAttr,
  scalarShape,
  stringType,
} from '../raw-utils';

/* -------------------- */
/* ----- METADATA ----- */

export const mockDomain = 'source.h5';

export const mockMetadata = makeMyNxEntityGroup(mockDomain, 'NXroot', {
  defaultPath: 'nexus_entry',
  children: [
    makeMyGroup('entities', [
      makeMyGroup('empty_group'),
      makeMyExternalLink('external_link', 'my_file', 'entry_000/dataset'),
      makeMyDatatype('datatype', compoundType),
      makeMyDataset('raw', scalarShape, compoundType),
      makeMyDataset('scalar_int', scalarShape, intType),
      makeMyDataset('scalar_str', scalarShape, stringType),
    ]),
    makeMyGroup('nD_datasets', [
      makeMySimpleDataset('oneD_linear', intType, [41]),
      makeMySimpleDataset('oneD', intType, [41]),
      makeMySimpleDataset('twoD', intType, [20, 41]),
      makeMySimpleDataset('threeD', intType, [9, 20, 41]),
      makeMySimpleDataset('fourD', intType, [3, 9, 20, 41]),
    ]),
    makeMyNxEntityGroup('nexus_entry', 'NXentry', {
      defaultPath: 'nx_process/nx_data',
      children: [
        makeMyNxEntityGroup('nx_process', 'NXprocess', {
          children: [
            makeMyNxDataGroup('nx_data', {
              signal: makeMyNxDataset('twoD', intType, [20, 41]),
              silxStyle: { signalScaleType: ScaleType.SymLog },
              title: makeMyDataset('title', scalarShape, stringType, {
                id: 'title_twoD',
              }),
            }),
          ],
        }),
        makeMyNxDataGroup('spectrum', {
          signal: makeMyNxDataset('twoD_spectrum', intType, [20, 41], {
            interpretation: 'spectrum',
            units: 'arb. units',
          }),
          errors: makeMyNxDataset('errors', floatType, [20, 41], {
            id: 'errors_twoD',
          }),
          axes: { X: makeMyNxDataset('X', intType, [41], { units: 'nm' }) },
          axesAttr: ['.', 'X'],
        }),
        makeMyNxDataGroup('image', {
          signal: makeMyNxDataset('fourD_image', intType, [3, 9, 20, 41], {
            longName: 'Interference fringes',
            interpretation: 'image',
          }),
          axes: {
            X: makeMyNxDataset('X', intType, [41], { units: 'nm' }),
            Y: makeMyNxDataset('Y', intType, [20], {
              units: 'deg',
              longName: 'Angle (degrees)',
            }),
          },
          axesAttr: ['.', '.', 'Y', 'X'],
          silxStyle: { signalScaleType: ScaleType.Log },
        }),
        makeMyNxDataGroup('log_spectrum', {
          signal: makeMyNxDataset('oneD', intType, [41]),
          errors: makeMyNxDataset('oneD_errors', intType, [41]),
          axes: { X_log: makeMyNxDataset('X_log', floatType, [41]) },
          axesAttr: ['X_log'],
          silxStyle: {
            signalScaleType: ScaleType.Log,
            axesScaleType: [ScaleType.Log],
          },
        }),
      ],
    }),
    makeMyGroup('nexus_malformed', [
      makeMyGroup('default_not_string', [], {
        attributes: [makeAttr('default', scalarShape, intType, 42)],
      }),
      makeMyGroup('default_empty', [], {
        attributes: [makeStrAttr('default', '')],
      }),
      makeMyGroup('default_not_found', [], {
        attributes: [makeStrAttr('default', '/test')],
      }),
      makeMyNxEntityGroup('default_not_group', 'NXentry', {
        defaultPath: 'scalar_int',
        children: [makeMyDataset('scalar_int', scalarShape, intType)],
      }),
      makeMyGroup('no_signal', [], {
        attributes: [makeStrAttr('NX_class', 'NXdata')],
      }),
      makeMyGroup('signal_not_string', [], {
        attributes: [
          makeStrAttr('NX_class', 'NXdata'),
          makeAttr('signal', scalarShape, intType, 42),
        ],
      }),
      makeMyGroup('signal_not_found', [], {
        attributes: [
          makeStrAttr('NX_class', 'NXdata'),
          makeStrAttr('signal', 'unknown'),
        ],
      }),
      makeMyGroup('signal_not_dataset', [makeMyGroup('empty_group')], {
        attributes: [
          makeStrAttr('NX_class', 'NXdata'),
          makeStrAttr('signal', 'empty_group'),
        ],
      }),
      makeMyGroup(
        'signal_dataset_not_numeric',
        [makeMySimpleDataset('oneD_str', stringType, [2])],
        {
          attributes: [
            makeStrAttr('NX_class', 'NXdata'),
            makeStrAttr('signal', 'oneD_str'),
          ],
        }
      ),
      makeMyGroup(
        'signal_dataset_not_simple',
        [makeMyDataset('scalar_int', scalarShape, intType)],
        {
          attributes: [
            makeStrAttr('NX_class', 'NXdata'),
            makeStrAttr('signal', 'scalar_int'),
          ],
        }
      ),
      makeMyGroup(
        'signal_dataset_zero_dim',
        [makeMySimpleDataset('zeroD', intType, [], { id: 'null' })],
        {
          attributes: [
            makeStrAttr('NX_class', 'NXdata'),
            makeStrAttr('signal', 'zeroD'),
          ],
        }
      ),
    ]),
  ],
});

/* ------------------ */
/* ----- VALUES ----- */

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
  scalar_int: 0,
  scalar_str: 'foo',
  oneD_linear: arr1,
  oneD,
  twoD,
  twoD_spectrum: twoD,
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
};
