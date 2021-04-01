import { ScaleType } from '../../vis-packs/core/models';
import {
  compoundType,
  floatType,
  intType,
  stringType,
  makeStrAttr,
  makeDatatype,
  makeExternalLink,
  makeGroup,
  makeNxDataGroup,
  makeNxDataset,
  makeNxGroup,
  booleanType,
  complexType,
  makeScalarDataset,
  makeDataset,
  makeScalarAttr,
} from './metadata-utils';

export const mockFilepath = 'source.h5';

export const mockMetadata = makeNxGroup(mockFilepath, 'NXroot', {
  isRoot: true,
  defaultPath: 'nexus_entry',
  children: [
    makeGroup('entities', [
      makeGroup('empty_group'),
      makeExternalLink('external_link', 'my_file', 'entry_000/dataset'),
      makeDataset('empty_dataset', intType, null),
      makeDatatype('datatype', compoundType),
      makeScalarDataset('raw', compoundType),
      makeScalarDataset('raw_large', compoundType),
      makeScalarDataset('scalar_int', intType),
      makeScalarDataset('scalar_str', stringType),
      makeScalarDataset('scalar_bool', booleanType),
      makeScalarDataset('scalar_cplx', complexType),
    ]),
    makeGroup('nD_datasets', [
      makeDataset('oneD_linear', intType, [41]),
      makeDataset('oneD', intType, [41]),
      makeDataset('twoD', intType, [20, 41]),
      makeDataset('twoD_cplx', complexType, [2, 2]),
      makeDataset('threeD', intType, [9, 20, 41]),
      makeDataset('threeD_bool', booleanType, [2, 3, 4]),
      makeDataset('fourD', intType, [3, 9, 20, 41]),
    ]),
    makeNxGroup('nexus_entry', 'NXentry', {
      defaultPath: 'nx_process/nx_data',
      children: [
        makeNxGroup('nx_process', 'NXprocess', {
          children: [
            makeNxDataGroup('nx_data', {
              signal: makeNxDataset('twoD', intType, [20, 41]),
              silxStyle: { signalScaleType: ScaleType.SymLog },
              title: makeScalarDataset('title', stringType, {
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
        makeNxDataGroup('spectrum_with_aux', {
          signal: makeNxDataset('twoD_spectrum', intType, [20, 41], {
            interpretation: 'spectrum',
            units: 'arb. units',
          }),
          errors: makeNxDataset('errors', floatType, [20, 41], {
            valueId: 'errors_twoD',
          }),
          axes: { X: makeNxDataset('X', intType, [41], { units: 'nm' }) },
          axesAttr: ['.', 'X'],
          auxiliary: {
            secondary: makeNxDataset('secondary', intType, [20, 41]),
            tertiary: makeNxDataset('tertiary', intType, [20, 41]),
          },
          auxAttr: ['secondary', 'tertiary'],
        }),
      ],
    }),
    makeGroup('nexus_malformed', [
      makeGroup('default_not_string', [], {
        attributes: [makeScalarAttr('default', intType, 42)],
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
