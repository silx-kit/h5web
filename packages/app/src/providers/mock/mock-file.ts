import type { GroupWithChildren } from '@h5web/shared/hdf5-models';
import {
  arrayType,
  boolType,
  compoundType,
  cplx,
  cplxType,
  enumType,
  floatType,
  intType,
  printableCompoundType,
  strType,
  uintType,
  unknownType,
} from '@h5web/shared/hdf5-utils';
import {
  array,
  dataset,
  datatype,
  group,
  nxData,
  nxGroup,
  scalar,
  scalarAttr,
  unresolved,
  withImageAttr,
  withNxAttr,
} from '@h5web/shared/mock-utils';
import { ScaleType } from '@h5web/shared/vis-models';

export function makeMockFile(): GroupWithChildren {
  return nxGroup('source.h5', 'NXroot', {
    isRoot: true,
    defaultPath: 'nexus_entry',
    children: [
      group('entities', [
        group('empty_group'),
        dataset('empty_dataset', unknownType(), null, null),
        datatype('datatype', compoundType({ int: intType() })),
        scalar('raw', { int: 42 }),
        scalar('raw_large', undefined), // generated dynamically by `MockProvider`
        scalar('scalar_num', 0, { attributes: [scalarAttr('attr', 0)] }),
        scalar('scalar_str', 'foo', {
          attributes: [scalarAttr('attr', 'foo')],
        }),
        scalar('scalar_bool', true, { attributes: [scalarAttr('attr', true)] }),
        scalar('scalar_cplx', [1, 5], {
          attributes: [scalarAttr('attr', cplx(1, 5))],
        }),
        scalar('scalar_compound', ['foo', 2], {
          type: compoundType({ str: strType('ASCII', 3), int: intType(8) }),
          attributes: [
            scalarAttr('attr', ['foo', 2], {
              type: compoundType({ str: strType('UTF-8'), int: intType(8) }),
            }),
          ],
        }),
        scalar('scalar_array', [1, 2], {
          type: arrayType(intType(), [2]),
          attributes: [
            scalarAttr('attr', [1, 2], { type: arrayType(intType(), [2]) }),
          ],
        }),
        scalar('scalar_vlen', [1, 2, 3], {
          type: arrayType(intType()),
          attributes: [
            scalarAttr('attr', [1, 2, 3], { type: arrayType(intType()) }),
          ],
        }),
        scalar('scalar_enum', 2, {
          type: enumType(uintType(8), { FOO: 0, BAR: 1, BAZ: 2 }),
          attributes: [
            scalarAttr('attr', 2, {
              type: enumType(uintType(8), { FOO: 0, BAR: 1, BAZ: 2 }),
            }),
          ],
        }),
        unresolved('unresolved_hard_link', 'Hard'),
        unresolved('unresolved_soft_link', 'Soft', '/foo'),
        unresolved(
          'unresolved_external_link',
          'External',
          'entry_000/dataset',
          'my_file.h5',
        ),
      ]),
      group('nD_datasets', [
        array('oneD_linear'),
        array('oneD'),
        array('oneD_cplx'),
        array('oneD_compound', {
          type: printableCompoundType({
            string: strType(),
            int: intType(),
            float: floatType(),
            bool: boolType(),
            complex: cplxType(floatType()),
          }),
        }),
        array('oneD_bool'),
        array('twoD'),
        array('twoD_cplx'),
        array('twoD_compound', {
          type: printableCompoundType({
            string: strType(),
            int: intType(),
            float: floatType(),
            bool: boolType(),
            complex: cplxType(floatType()),
          }),
        }),
        array('twoD_bool'),
        array('threeD'),
        array('threeD_bool'),
        array('threeD_cplx'),
        withImageAttr(array('threeD_rgb')),
        array('fourD'),
      ]),
      group('typed_arrays', [
        array('uint8', { type: uintType(8) }),
        array('int16', { type: intType(16) }),
        array('float32', { type: floatType(32) }),
        array('float64', { type: floatType(64) }),
        withImageAttr(array('uint8_rgb', { type: uintType(8) })),
        withImageAttr(array('int8_rgb', { type: intType(8) })),
        withImageAttr(array('int32_rgb', { type: intType(32) })),
        withImageAttr(array('float32_rgb', { type: floatType(32) })),
      ]),
      nxGroup('nexus_entry', 'NXentry', {
        defaultPath: 'nx_process/nx_data',
        children: [
          nxGroup('nx_process', 'NXprocess', {
            children: [
              nxData('nx_data', {
                signal: array('twoD'),
                silxStyle: { signalScaleType: ScaleType.SymLog },
                title: scalar('title', 'NeXus 2D'),
              }),
              nxGroup('absolute_default_path', 'NXentry', {
                defaultPath: '/nexus_entry/nx_process/nx_data',
              }),
            ],
          }),
          nxData('spectrum', {
            signal: withNxAttr(array('twoD'), {
              interpretation: 'spectrum',
              units: 'arb. units',
            }),
            errors: array('errors', { valueId: 'twoD_errors' }),
            axes: { X: withNxAttr(array('X'), { units: 'nm' }) },
            axesAttr: ['.', 'X'],
          }),
          nxData('image', {
            signal: withNxAttr(array('fourD'), {
              longName: 'Interference fringes',
              interpretation: 'image',
            }),
            axes: {
              X: withNxAttr(array('X'), { units: 'nm' }),
              Y: withNxAttr(array('Y'), {
                units: 'deg',
                longName: 'Angle (degrees)',
              }),
            },
            axesAttr: ['.', '.', 'Y', 'X'],
            silxStyle: { signalScaleType: ScaleType.Log },
          }),
          nxData('log_spectrum', {
            signal: array('oneD'),
            errors: array('oneD_errors'),
            axes: { X_log: array('X_log') },
            axesAttr: ['X_log'],
            silxStyle: {
              signalScaleType: ScaleType.Log,
              axisScaleTypes: [ScaleType.Log],
            },
          }),
          nxData('spectrum_with_aux', {
            signal: withNxAttr(array('twoD'), {
              interpretation: 'spectrum',
              units: 'arb. units',
            }),
            errors: array('errors', { valueId: 'twoD_errors' }),
            axes: { X: withNxAttr(array('X'), { units: 'nm' }) },
            axesAttr: ['.', 'X'],
            auxiliary: {
              secondary: array('secondary'),
              tertiary: array('tertiary'),
            },
            auxAttr: ['secondary', 'tertiary'],
            children: [array('secondary_errors', { valueId: 'twoD_errors' })],
          }),
          nxData('complex', {
            signal: array('twoD_cplx'),
            axes: { position: array('position') },
            axesAttr: ['.', 'position'],
          }),
          nxData('complex_spectrum', {
            signal: withNxAttr(array('twoD_cplx'), {
              interpretation: 'spectrum',
            }),
          }),
          nxData('rgb-image', {
            signal: withImageAttr(
              withNxAttr(array('fourD_rgb'), {
                longName: 'RGB CMY DGW',
                interpretation: 'rgb-image',
              }),
            ),
            axes: { X_rgb: array('X_rgb'), Y_rgb: array('Y_rgb') },
            axesAttr: ['.', 'Y_rgb', 'X_rgb'],
          }),
          nxData('descending-axes', {
            signal: array('twoD'),
            axes: { X_desc: array('X_desc'), Y_desc: array('Y_desc') },
            axesAttr: ['Y_desc', 'X_desc'],
          }),
          nxData('scatter', {
            signal: array('scatter_data'),
            axes: { X: array('X'), Y_scatter: array('Y_scatter') },
            axesAttr: ['X', 'Y_scatter'],
          }),
          nxGroup('old-style', 'NXdata', {
            children: [
              array('twoD', {
                attributes: [
                  scalarAttr('signal', 1),
                  scalarAttr('axes', 'Y:X'),
                ],
              }),
              withNxAttr(array('X'), { units: 'nm' }),
              withNxAttr(array('Y'), {
                units: 'deg',
                longName: 'Angle (degrees)',
              }),
            ],
          }),
        ],
      }),
      nxGroup('nexus_no_default', 'NXprocess', {
        defaultPath: undefined,
        children: [
          nxGroup('ignore_me', 'NXentry'),
          nxData('spectrum', { signal: array('oneD') }),
        ],
      }),
      group('nexus_malformed', [
        group('default_not_found', [], {
          attributes: [scalarAttr('default', '/test')],
        }),
        group('no_signal', [], {
          attributes: [scalarAttr('NX_class', 'NXdata')],
        }),
        group('signal_not_found', [], {
          attributes: [
            scalarAttr('NX_class', 'NXdata'),
            scalarAttr('signal', 'unknown'),
          ],
        }),
        nxGroup('signal_not_dataset', 'NXdata', {
          children: [group('some_group')],
          attributes: [scalarAttr('signal', 'some_group')],
        }),
        nxGroup('signal_old-style_not_dataset', 'NXdata', {
          children: [
            group('some_group', [], { attributes: [scalarAttr('signal', 1)] }),
          ],
        }),
        nxGroup('signal_not_array', 'NXdata', {
          children: [scalar('some_scalar', 0)],
          attributes: [scalarAttr('signal', 'some_scalar')],
        }),
        nxGroup('signal_not_numeric', 'NXdata', {
          children: [array('oneD_str')],
          attributes: [scalarAttr('signal', 'oneD_str')],
        }),
        nxData('interpretation_unknown', {
          signal: withNxAttr(array('fourD'), { interpretation: 'unknown' }),
        }),
        nxData('rgb-image_incompatible', {
          signal: withNxAttr(array('oneD'), { interpretation: 'rgb-image' }),
        }),
        nxData('silx_style_unknown', {
          signal: array('oneD'),
          axes: { X: array('X') },
          axesAttr: ['X'],
          attributes: [
            scalarAttr(
              'SILX_style',
              JSON.stringify({
                unknown: ScaleType.Log,
                signal_scale_type: 'invalid',
                axes_scale_type: ['invalid'],
              }),
            ),
          ],
        }),
        nxData('silx_style_malformed', {
          signal: array('oneD'),
          attributes: [scalarAttr('SILX_style', '{')],
        }),
      ]),
      group('resilience', [
        scalar('error_value', 0),
        scalar('slow_value', 42),
        array('slow_slicing', { valueId: 'threeD' }),
        group('slow_metadata'),
        nxData('slow_nx_spectrum', {
          signal: withNxAttr(array('slow_twoD', { valueId: 'twoD' }), {
            interpretation: 'spectrum',
          }),
          errors: array('slow_twoD_errors', { valueId: 'twoD_errors' }),
          axes: { slow_X: array('slow_X', { valueId: 'X' }) },
          axesAttr: ['.', 'slow_X'],
          auxiliary: {
            slow_secondary: array('slow_secondary', { valueId: 'secondary' }),
          },
          auxAttr: ['slow_secondary'],
          title: scalar('title', 'NeXus 2D'),
        }),
        nxData('slow_nx_image', {
          signal: array('slow_threeD', { valueId: 'threeD' }),
          axes: {
            slow_X: array('slow_X', { valueId: 'X' }),
            slow_Y: array('slow_Y', { valueId: 'Y' }),
          },
          axesAttr: ['.', 'slow_Y', 'slow_X'],
          title: scalar('title', 'NeXus 2D'),
        }),
      ]),
    ],
  });
}
