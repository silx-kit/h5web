import { DTypeClass } from '../models-hdf5';
import { ScaleType } from '../models-vis';
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
  withImageAttributes,
  withAttributes,
  makeIntAttr,
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
      makeDataset(
        'oneD_compound',
        {
          class: DTypeClass.Compound,
          fields: {
            string: stringType,
            int: intType,
            float: floatType,
            bool: booleanType,
            complex: complexType,
          },
        },
        [5]
      ),
      makeDataset('twoD', intType, [20, 41]),
      makeDataset('twoD_cplx', complexType, [2, 2]),
      makeDataset('threeD', intType, [9, 20, 41]),
      makeDataset('threeD_bool', booleanType, [2, 3, 4]),
      makeDataset('threeD_cplx', complexType, [2, 3, 4]),
      withImageAttributes(makeDataset('threeD_rgb', intType, [3, 3, 3])),
      makeDataset('fourD', intType, [3, 9, 20, 41]),
    ]),
    makeGroup('typed_arrays', [
      makeDataset('uint8', intType, [2, 2]),
      makeDataset('int16', intType, [2, 2]),
      makeDataset('float32', intType, [2, 2]),
      makeDataset('float64', intType, [2, 2]),
      withImageAttributes(makeDataset('int8_rgb', intType, [3, 3, 3])),
      withImageAttributes(makeDataset('uint8_rgb', intType, [3, 3, 3])),
      withImageAttributes(makeDataset('int32_rgb', intType, [3, 3, 3])),
      withImageAttributes(makeDataset('float32_rgb', intType, [3, 3, 3])),
    ]),
    makeNxGroup('nexus_entry', 'NXentry', {
      defaultPath: 'nx_process/nx_data',
      children: [
        makeNxGroup('nx_process', 'NXprocess', {
          children: [
            makeNxDataGroup('nx_data', {
              signal: makeDataset('twoD', intType, [20, 41]),
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
          errors: makeDataset('errors', floatType, [20, 41], {
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
          signal: makeDataset('oneD', intType, [41]),
          errors: makeDataset('oneD_errors', intType, [41]),
          axes: { X_log: makeDataset('X_log', floatType, [41]) },
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
          errors: makeDataset('errors', floatType, [20, 41], {
            valueId: 'twoD_errors',
          }),
          axes: { X: makeNxDataset('X', intType, [41], { units: 'nm' }) },
          axesAttr: ['.', 'X'],
          auxiliary: {
            secondary: makeDataset('secondary', intType, [20, 41]),
            tertiary: makeDataset('tertiary', intType, [20, 41]),
          },
          auxAttr: ['secondary', 'tertiary'],
        }),
        makeNxDataGroup('complex', {
          signal: makeDataset('twoD_complex', complexType, [2, 2], {
            valueId: 'twoD_cplx',
          }),
          axes: { position: makeDataset('position', intType, [2]) },
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
        makeNxDataGroup('descending-axes', {
          signal: makeDataset('twoD', intType, [20, 41]),
          axes: {
            X: makeNxDataset('X', intType, [41], { valueId: 'X_desc' }),
            Y: makeNxDataset('Y', intType, [20], { valueId: 'Y_desc' }),
          },
          axesAttr: ['Y', 'X'],
        }),
        makeNxDataGroup('scatter', {
          signal: makeDataset('scatter_data', intType, [41]),
          axes: {
            X: makeNxDataset('X', intType, [41], { valueId: 'X' }),
            Y: makeNxDataset('Y', intType, [41], { valueId: 'Y_scatter' }),
          },
          axesAttr: ['X', 'Y'],
        }),
        makeNxGroup('old-style', 'NXdata', {
          children: [
            makeDataset('twoD', intType, [20, 41], {
              attributes: [
                makeIntAttr('signal', 1),
                makeStrAttr('axes', 'Y:X'),
              ],
            }),
            makeNxDataset('X', intType, [41], { units: 'nm' }),
            makeNxDataset('Y', intType, [20], {
              units: 'deg',
              longName: 'Angle (degrees)',
            }),
          ],
        }),
      ],
    }),
    makeNxGroup('nexus_no_default', 'NXprocess', {
      defaultPath: undefined,
      children: [
        makeNxGroup('ignore_me', 'NXentry'),
        makeNxDataGroup('spectrum', {
          signal: makeDataset('oneD', intType, [41]),
        }),
      ],
    }),
    makeGroup('nexus_malformed', [
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
      makeNxGroup('signal_not_dataset', 'NXdata', {
        children: [makeGroup('some_group')],
        attributes: [makeStrAttr('signal', 'some_group')],
      }),
      makeNxGroup('signal_old-style_not_dataset', 'NXdata', {
        children: [
          makeGroup('some_group', [], {
            attributes: [makeIntAttr('signal', 1)],
          }),
        ],
      }),
      makeNxGroup('signal_not_array', 'NXdata', {
        children: [makeScalarDataset('some_scalar', intType)],
        attributes: [makeStrAttr('signal', 'some_scalar')],
      }),
      makeNxGroup('signal_not_numeric', 'NXdata', {
        children: [makeDataset('oneD_str', stringType, [2])],
        attributes: [makeStrAttr('signal', 'oneD_str')],
      }),
      makeNxDataGroup('interpretation_unknown', {
        signal: makeNxDataset('fourD', intType, [3, 9, 20, 41], {
          interpretation: 'unknown',
        }),
      }),
      makeNxDataGroup('rgb-image_incompatible', {
        signal: makeNxDataset('oneD', intType, [41], {
          interpretation: 'rgb-image',
        }),
      }),
      withAttributes(
        makeNxDataGroup('silx_style_unknown', {
          signal: makeDataset('oneD', intType, [41]),
          axes: { X: makeDataset('X', intType, [41]) },
          axesAttr: ['X'],
        }),
        [
          makeStrAttr(
            'SILX_style',
            JSON.stringify({
              unknown: ScaleType.Log,
              signal_scale_type: 'invalid',
              axes_scale_type: ['invalid'],
            })
          ),
        ]
      ),
      withAttributes(
        makeNxDataGroup('silx_style_malformed', {
          signal: makeDataset('oneD', intType, [41]),
        }),
        [makeStrAttr('SILX_style', '{')]
      ),
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
        errors: makeDataset('slow_twoD_errors', intType, [20, 41], {
          valueId: 'twoD_errors',
        }),
        axes: {
          slow_X: makeDataset('slow_X', intType, [41], { valueId: 'X' }),
        },
        axesAttr: ['.', 'slow_X'],
        auxiliary: {
          secondary: makeDataset('slow_secondary', intType, [20, 41], {
            valueId: 'secondary',
          }),
        },
        auxAttr: ['slow_secondary'],
        title: makeScalarDataset('title', stringType, {
          valueId: 'title_twoD',
        }),
      }),
      makeNxDataGroup('slow_nx_image', {
        signal: makeDataset('slow_threeD', intType, [9, 20, 41], {
          valueId: 'threeD',
        }),
        axes: {
          slow_X: makeDataset('slow_X', intType, [41], { valueId: 'X' }),
          slow_Y: makeDataset('slow_Y', intType, [20], { valueId: 'Y' }),
        },
        axesAttr: ['.', 'slow_Y', 'slow_X'],
        title: makeScalarDataset('title', stringType, {
          valueId: 'title_twoD',
        }),
      }),
    ]),
  ],
});
