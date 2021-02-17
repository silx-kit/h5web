import { ScaleType } from '../../vis-packs/core/models';
import {
  compoundType,
  floatType,
  intType,
  scalarShape,
  stringType,
  makeStrAttr,
  makeDataset,
  makeDatatype,
  makeExternalLink,
  makeGroup,
  makeNxDataGroup,
  makeNxDataset,
  makeNxGroup,
  makeSimpleDataset,
  makeAttr,
  booleanType,
} from './metadata-utils';

export const mockFilepath = 'source.h5';

export const mockMetadata = makeNxGroup(mockFilepath, 'NXroot', {
  isRoot: true,
  defaultPath: 'nexus_entry',
  children: [
    makeGroup('entities', [
      makeGroup('empty_group'),
      makeExternalLink('external_link', 'my_file', 'entry_000/dataset'),
      makeDatatype('datatype', compoundType),
      makeDataset('raw', scalarShape, compoundType),
      makeDataset('raw_large', scalarShape, compoundType),
      makeDataset('scalar_int', scalarShape, intType),
      makeDataset('scalar_str', scalarShape, stringType),
      makeDataset('scalar_bool', scalarShape, booleanType),
    ]),
    makeGroup('nD_datasets', [
      makeSimpleDataset('oneD_linear', intType, [41]),
      makeSimpleDataset('oneD', intType, [41]),
      makeSimpleDataset('twoD', intType, [20, 41]),
      makeSimpleDataset('threeD', intType, [9, 20, 41]),
      makeSimpleDataset('threeD_bool', booleanType, [2, 3, 4]),
      makeSimpleDataset('fourD', intType, [3, 9, 20, 41]),
    ]),
    makeNxGroup('nexus_entry', 'NXentry', {
      defaultPath: 'nx_process/nx_data',
      children: [
        makeNxGroup('nx_process', 'NXprocess', {
          children: [
            makeNxDataGroup('nx_data', {
              signal: makeNxDataset('twoD', intType, [20, 41]),
              silxStyle: { signalScaleType: ScaleType.SymLog },
              title: makeDataset('title', scalarShape, stringType, {
                valueId: 'title_twoD',
              }),
            }),
            makeNxGroup('absolute_default_path', 'NXentry', {
              defaultPath: '/nexus_entry/nx_process/nx_data',
            }),
          ],
        }),
        makeNxDataGroup('spectrum', {
          signal: makeNxDataset('twoD_spectrum', intType, [20, 41], {
            interpretation: 'spectrum',
            units: 'arb. units',
          }),
          errors: makeNxDataset('errors', floatType, [20, 41], {
            valueId: 'errors_twoD',
          }),
          axes: { X: makeNxDataset('X', intType, [41], { units: 'nm' }) },
          axesAttr: ['.', 'X'],
        }),
        makeNxDataGroup('image', {
          signal: makeNxDataset('fourD_image', intType, [3, 9, 20, 41], {
            longName: 'Interference fringes',
            interpretation: 'image',
          }),
          axes: {
            X: makeNxDataset('X', intType, [41], { units: 'nm' }),
            Y: makeNxDataset('Y', intType, [20], {
              units: 'deg',
              longName: 'Angle (degrees)',
            }),
          },
          axesAttr: ['.', '.', 'Y', 'X'],
          silxStyle: { signalScaleType: ScaleType.Log },
        }),
        makeNxDataGroup('log_spectrum', {
          signal: makeNxDataset('oneD', intType, [41]),
          errors: makeNxDataset('oneD_errors', intType, [41]),
          axes: { X_log: makeNxDataset('X_log', floatType, [41]) },
          axesAttr: ['X_log'],
          silxStyle: {
            signalScaleType: ScaleType.Log,
            axesScaleType: [ScaleType.Log],
          },
        }),
      ],
    }),
    makeGroup('nexus_malformed', [
      makeGroup('default_not_string', [], {
        attributes: [makeAttr('default', scalarShape, intType, 42)],
      }),
      makeGroup('default_not_found', [], {
        attributes: [makeStrAttr('default', '/test')],
      }),
      makeGroup('no_signal', [], {
        attributes: [makeStrAttr('NX_class', 'NXdata')],
      }),
      makeGroup('signal_not_found', [], {
        attributes: [
          makeStrAttr('NX_class', 'NXdata'),
          makeStrAttr('signal', 'unknown'),
        ],
      }),
    ]),
  ],
});
