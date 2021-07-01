import { ScaleType } from '../../vis-packs/core/models';
import {
  compoundType,
  floatType,
  intType,
  stringType,
  makeStrAttr,
  makeDatatype,
  makeUnresolvedEntity,
  makeGroup,
  makeNxDataGroup,
  makeNxDataset,
  makeNxGroup,
  booleanType,
  complexType,
  makeScalarDataset,
  makeDataset,
  makeScalarAttr,
  withImageAttributes,
} from './metadata-utils';

export const mockFilepath = 'source.h5';

export const mockMetadata = makeNxGroup(mockFilepath, 'NXroot', {
  isRoot: true,
  defaultPath: 'nexus_entry',
  children: [
    makeGroup('entities', [
      makeGroup('empty_group'),
      makeDataset('empty_dataset', intType, null),
      makeDatatype('datatype', compoundType),
      makeScalarDataset('raw', compoundType),
      makeScalarDataset('raw_large', compoundType),
      makeScalarDataset('scalar_int', intType),
      makeScalarDataset('scalar_str', stringType),
      makeScalarDataset('scalar_bool', booleanType),
      makeScalarDataset('scalar_cplx', complexType),
      makeUnresolvedEntity('unresolved_hard_link', 'Hard'),
      makeUnresolvedEntity('unresolved_soft_link', 'Soft', '/foo'),
      makeUnresolvedEntity(
        'unresolved_external_link',
        'External',
        'entry_000/dataset',
        'my_file.h5'
      ),
    ]),
    makeGroup('nD_datasets', [
      makeDataset('oneD_linear', intType, [41]),
      makeDataset('oneD', intType, [41]),
      makeDataset('oneD_cplx', complexType, [10]),
      makeDataset('twoD', intType, [20, 41]),
      makeDataset('twoD_cplx', complexType, [2, 2]),
      makeDataset('threeD', intType, [9, 20, 41]),
      makeDataset('threeD_bool', booleanType, [2, 3, 4]),
      makeDataset('threeD_cplx', complexType, [2, 3, 4]),
      withImageAttributes(makeDataset('threeD_rgb', intType, [3, 3, 3])),
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
            valueId: 'twoD',
            interpretation: 'spectrum',
            units: 'arb. units',
          }),
          errors: makeNxDataset('errors', floatType, [20, 41], {
            valueId: 'twoD_errors',
          }),
          axes: { X: makeNxDataset('X', intType, [41], { units: 'nm' }) },
          axesAttr: ['.', 'X'],
        }),
        makeNxDataGroup('image', {
          signal: makeNxDataset('fourD_image', intType, [3, 9, 20, 41], {
            valueId: 'fourD',
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
            axisScaleTypes: [ScaleType.Log],
          },
        }),
        makeNxDataGroup('spectrum_with_aux', {
          signal: makeNxDataset('twoD_spectrum', intType, [20, 41], {
            valueId: 'twoD',
            interpretation: 'spectrum',
            units: 'arb. units',
          }),
          errors: makeNxDataset('errors', floatType, [20, 41], {
            valueId: 'twoD_errors',
          }),
          axes: { X: makeNxDataset('X', intType, [41], { units: 'nm' }) },
          axesAttr: ['.', 'X'],
          auxiliary: {
            secondary: makeNxDataset('secondary', intType, [20, 41]),
            tertiary: makeNxDataset('tertiary', intType, [20, 41]),
          },
          auxAttr: ['secondary', 'tertiary'],
        }),
        makeNxDataGroup('complex_image', {
          signal: makeNxDataset('twoD_complex', complexType, [2, 2], {
            valueId: 'twoD_cplx',
          }),
          axes: { position: makeNxDataset('position', intType, [3]) },
          axesAttr: ['.', 'position'],
        }),
        makeNxDataGroup('complex_spectrum', {
          signal: makeNxDataset('twoD_complex', complexType, [2, 2], {
            valueId: 'twoD_cplx',
            interpretation: 'spectrum',
          }),
        }),
        makeNxDataGroup('rgb-image', {
          signal: withImageAttributes(
            makeNxDataset('threeD_rgb', intType, [3, 3, 3], {
              longName: 'RGB CMY DGW',
              interpretation: 'rgb-image',
            })
          ),
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
    makeGroup('resilience', [
      makeScalarDataset('error_value', intType),
      makeScalarDataset('slow_value', intType, { valueId: 'scalar_int_42' }),
      makeDataset('slow_slicing', intType, [9, 20, 41], { valueId: 'threeD' }),
      makeGroup('slow_metadata'),
      makeNxDataGroup('slow_nx_spectrum', {
        signal: makeNxDataset('slow_twoD', intType, [20, 41], {
          valueId: 'twoD',
          interpretation: 'spectrum',
        }),
        errors: makeNxDataset('slow_twoD_errors', intType, [20, 41], {
          valueId: 'twoD_errors',
        }),
        axes: {
          slow_X: makeNxDataset('slow_X', intType, [41], { valueId: 'X' }),
        },
        axesAttr: ['.', 'slow_X'],
        auxiliary: {
          secondary: makeNxDataset('slow_secondary', intType, [20, 41], {
            valueId: 'secondary',
          }),
        },
        auxAttr: ['slow_secondary'],
        title: makeScalarDataset('title', stringType, {
          valueId: 'title_twoD',
        }),
      }),
      makeNxDataGroup('slow_nx_image', {
        signal: makeNxDataset('slow_threeD', intType, [9, 20, 41], {
          valueId: 'threeD',
        }),
        axes: {
          slow_X: makeNxDataset('slow_X', intType, [41], { valueId: 'X' }),
          slow_Y: makeNxDataset('slow_Y', intType, [20], { valueId: 'Y' }),
        },
        axesAttr: ['.', 'slow_Y', 'slow_X'],
        title: makeScalarDataset('title', stringType, {
          valueId: 'title_twoD',
        }),
      }),
    ]),
  ],
});
