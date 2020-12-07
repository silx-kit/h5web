import { range } from 'lodash-es';
import {
  HDF5Id,
  HDF5LinkClass,
  HDF5ExternalLink,
  HDF5Collection,
  HDF5Attribute,
  HDF5Dataset,
  HDF5Metadata,
  HDF5TypeClass,
  HDF5IntegerType,
  HDF5FloatType,
  HDF5StringType,
  HDF5CompoundType,
  HDF5SimpleShape,
  HDF5Dims,
  HDF5ShapeClass,
  HDF5ScalarShape,
  HDF5Type,
  HDF5Shape,
  HDF5Group,
  HDF5Link,
  HDF5Datatype,
  HDF5Value,
  HDF5HardLink,
} from '../models';

/* ----------------- */
/* ----- TYPES ----- */

export const intType: HDF5IntegerType = {
  class: HDF5TypeClass.Integer,
  base: 'H5T_STD_I32LE',
};

export const floatType: HDF5FloatType = {
  class: HDF5TypeClass.Float,
  base: 'H5T_IEEE_F64LE',
};

export const stringType: HDF5StringType = {
  class: HDF5TypeClass.String,
  charSet: 'H5T_CSET_ASCII',
  strPad: 'H5T_STR_NULLPAD',
  length: 1,
};

export const compoundType: HDF5CompoundType = {
  class: HDF5TypeClass.Compound,
  fields: [{ name: 'int', type: intType }],
};

/* ------------------ */
/* ----- SHAPES ----- */

export const scalarShape: HDF5ScalarShape = { class: HDF5ShapeClass.Scalar };

export function makeSimpleShape(dims: HDF5Dims): HDF5SimpleShape {
  return { class: HDF5ShapeClass.Simple, dims };
}

/* ---------------------- */
/* ----- ATTRIBUTES ----- */

export function makeAttr(
  name: string,
  shape: HDF5Shape,
  type: HDF5Type,
  value: HDF5Value
): HDF5Attribute {
  return { name, type, shape, value };
}

export function makeStrAttr(name: string, value: HDF5Value): HDF5Attribute {
  return makeAttr(name, scalarShape, stringType, value);
}

/* -------------------- */
/* ----- ENTITIES ----- */

export function makeDataset(
  id: HDF5Id,
  type: HDF5Type,
  shape: HDF5Shape,
  attributes?: HDF5Attribute[]
): HDF5Dataset {
  return { id, collection: HDF5Collection.Datasets, type, shape, attributes };
}

function makeSimpleDataset(
  id: HDF5Id,
  type: HDF5Type,
  dims: HDF5Dims,
  attributes?: HDF5Attribute[]
): HDF5Dataset {
  return makeDataset(id, type, makeSimpleShape(dims), attributes);
}

export function makeGroup(
  id: HDF5Id,
  attributes?: HDF5Attribute[],
  links?: HDF5Link[]
): HDF5Group {
  return { id, collection: HDF5Collection.Groups, attributes, links };
}

function makeDatatype(id: HDF5Id, type: HDF5Type): HDF5Datatype {
  return { id, collection: HDF5Collection.Datatypes, type };
}

/* ----------------- */
/* ----- LINKS ----- */

export function makeHardLink(
  collection: HDF5Collection,
  title: string,
  id = title
): HDF5HardLink {
  return { class: HDF5LinkClass.Hard, title, collection, id };
}

function makeDatasetHardLink(title: string, id = title): HDF5HardLink {
  return makeHardLink(HDF5Collection.Datasets, title, id);
}

function makeGroupHardLink(title: string, id = title): HDF5HardLink {
  return makeHardLink(HDF5Collection.Groups, title, id);
}

function makeExternalLink(
  title: string,
  file: string,
  h5path: string
): HDF5ExternalLink {
  return { class: HDF5LinkClass.External, title, file, h5path };
}

/* ----------------- */
/* ----- NEXUS ----- */

function makeNxAxesAttr(axes: string[]): HDF5Attribute {
  return makeAttr('axes', makeSimpleShape([axes.length]), stringType, axes);
}

/* -------------------- */
/* ----- METADATA ----- */

export function makeMetadata(
  opts: {
    root?: HDF5Id;
    datasets?: HDF5Dataset[];
    groups?: HDF5Group[];
    datatypes?: HDF5Datatype[];
  } = {}
): HDF5Metadata {
  const { root = '', datasets = [], groups = [], datatypes = [] } = opts;

  return {
    root,
    datasets: Object.fromEntries(datasets.map((ds) => [ds.id, ds])),
    groups: Object.fromEntries(groups.map((gr) => [gr.id, gr])),
    datatypes: Object.fromEntries(datatypes.map((dt) => [dt.id, dt])),
  };
}

export const mockMetadata = makeMetadata({
  root: 'root',
  groups: [
    makeGroup(
      'root',
      [
        makeStrAttr('NX_class', 'NXroot'),
        makeStrAttr('default', 'nexus_entry'),
      ],
      [
        makeGroupHardLink('entities'),
        makeGroupHardLink('nD_datasets'),
        makeGroupHardLink('nexus_entry'),
        makeGroupHardLink('nexus_malformed'),
      ]
    ),

    // ==> Top-level groups
    makeGroup('entities', undefined, [
      makeGroupHardLink('empty_group'),
      makeExternalLink('external_link', 'my_file', 'entry_000/dataset'),
      makeHardLink(HDF5Collection.Datatypes, 'datatype'),
      makeDatasetHardLink('raw'),
      makeDatasetHardLink('scalar_int'),
      makeDatasetHardLink('scalar_str'),
    ]),
    makeGroup('nD_datasets', undefined, [
      makeDatasetHardLink('oneD_linear'),
      makeDatasetHardLink('oneD'),
      makeDatasetHardLink('twoD'),
      makeDatasetHardLink('threeD'),
      makeDatasetHardLink('fourD'),
    ]),
    makeGroup(
      'nexus_entry',
      [
        makeStrAttr('NX_class', 'NXentry'),
        makeStrAttr('default', 'nx_process/nx_data'),
      ],
      [
        makeGroupHardLink('nx_process'),
        makeGroupHardLink('spectrum'),
        makeGroupHardLink('image'),
        makeGroupHardLink('log_spectrum'),
      ]
    ),
    makeGroup('nexus_malformed', undefined, [
      makeGroupHardLink('default_not_string'),
      makeGroupHardLink('default_empty'),
      makeGroupHardLink('default_not_found'),
      makeGroupHardLink('default_not_group'),
      makeGroupHardLink('no_signal'),
      makeGroupHardLink('signal_not_string'),
      makeGroupHardLink('signal_not_found'),
      makeGroupHardLink('signal_not_dataset'),
      makeGroupHardLink('signal_dataset_not_numeric'),
      makeGroupHardLink('signal_dataset_not_simple'),
      makeGroupHardLink('signal_dataset_zero_dim'),
    ]),

    // ==> Inner groups
    makeGroup('empty_group'),
    makeGroup(
      'nx_process',
      [makeStrAttr('NX_class', 'NXprocess')], // intentionally has no `default` attribute
      [makeGroupHardLink('nx_data')]
    ),
    makeGroup(
      'nx_data',
      [
        makeStrAttr('NX_class', 'NXdata'),
        makeStrAttr('signal', 'twoD'),
        makeStrAttr(
          'SILX_style',
          JSON.stringify({ signal_scale_type: 'symlog' })
        ),
      ],
      [makeDatasetHardLink('twoD'), makeDatasetHardLink('title', 'title_twoD')]
    ),
    makeGroup(
      'spectrum',
      [
        makeStrAttr('NX_class', 'NXdata'),
        makeStrAttr('signal', 'twoD_spectrum'),
        makeNxAxesAttr(['.', 'X']),
      ],
      [
        makeDatasetHardLink('twoD_spectrum'),
        makeDatasetHardLink('X'),
        makeDatasetHardLink('errors', 'errors_twoD'),
      ]
    ),
    makeGroup(
      'image',
      [
        makeStrAttr('NX_class', 'NXdata'),
        makeStrAttr('signal', 'fourD_image'),
        makeStrAttr('SILX_style', JSON.stringify({ signal_scale_type: 'log' })),
        makeNxAxesAttr(['.', '.', 'Y', 'X']),
      ],
      [
        makeDatasetHardLink('fourD_image'),
        makeDatasetHardLink('X'),
        makeDatasetHardLink('Y'),
      ]
    ),
    makeGroup(
      'log_spectrum',
      [
        makeStrAttr('NX_class', 'NXdata'),
        makeStrAttr('signal', 'oneD'),
        makeStrAttr(
          'SILX_style',
          JSON.stringify({ axes_scale_type: ['log'], signal_scale_type: 'log' })
        ),
        makeNxAxesAttr(['X_log']),
      ],
      [
        makeDatasetHardLink('oneD', 'oneD'),
        makeDatasetHardLink('X_log'),
        makeDatasetHardLink('oneD_errors'),
      ]
    ),
    makeGroup('default_not_string', [
      makeAttr('default', scalarShape, intType, 42),
    ]),
    makeGroup('default_empty', [makeStrAttr('default', '')]),
    makeGroup('default_not_found', [makeStrAttr('default', '/test')]),
    makeGroup(
      'default_not_group',
      [makeStrAttr('default', 'scalar_int')],
      [makeDatasetHardLink('scalar_int')]
    ),
    makeGroup('no_signal', [makeStrAttr('NX_class', 'NXdata')]),
    makeGroup('signal_not_string', [
      makeStrAttr('NX_class', 'NXdata'),
      makeAttr('signal', scalarShape, intType, 42),
    ]),
    makeGroup('signal_not_found', [
      makeStrAttr('NX_class', 'NXdata'),
      makeStrAttr('signal', 'unknown'),
    ]),
    makeGroup(
      'signal_not_dataset',
      [makeStrAttr('NX_class', 'NXdata'), makeStrAttr('signal', 'empty_group')],
      [makeGroupHardLink('empty_group')]
    ),
    makeGroup(
      'signal_dataset_not_numeric',
      [makeStrAttr('NX_class', 'NXdata'), makeStrAttr('signal', 'oneD_str')],
      [makeDatasetHardLink('oneD_str')]
    ),
    makeGroup(
      'signal_dataset_not_simple',
      [makeStrAttr('NX_class', 'NXdata'), makeStrAttr('signal', 'scalar_int')],
      [makeDatasetHardLink('scalar_int')]
    ),
    makeGroup(
      'signal_dataset_zero_dim',
      [makeStrAttr('NX_class', 'NXdata'), makeStrAttr('signal', 'zeroD')],
      [makeDatasetHardLink('zeroD', 'null')]
    ),
  ],
  datasets: [
    makeSimpleDataset('oneD_linear', intType, [41]),
    makeSimpleDataset('oneD', intType, [41]),
    makeSimpleDataset('twoD', intType, [20, 41]),
    makeSimpleDataset('threeD', intType, [9, 20, 41]),
    makeSimpleDataset('fourD', intType, [3, 9, 20, 41]),
    makeDataset('raw', compoundType, scalarShape),
    makeDataset('scalar_int', intType, scalarShape),
    makeDataset('scalar_str', stringType, scalarShape),
    makeSimpleDataset('X', intType, [41], [makeStrAttr('units', 'nm')]),
    makeSimpleDataset(
      'Y',
      intType,
      [20],
      [makeStrAttr('units', 'deg'), makeStrAttr('long_name', 'Angle (degrees)')]
    ),
    makeDataset('title_twoD', stringType, scalarShape),
    makeSimpleDataset('X_log', floatType, [41]),
    makeSimpleDataset('oneD_str', stringType, [2]),
    makeSimpleDataset('null', intType, []),
    makeSimpleDataset(
      'twoD_spectrum',
      intType,
      [20, 41],
      [
        makeStrAttr('interpretation', 'spectrum'),
        makeStrAttr('units', 'arb. units'),
      ]
    ),
    makeSimpleDataset('errors_twoD', floatType, [20, 41]),
    makeSimpleDataset(
      'fourD_image',
      intType,
      [3, 9, 20, 41],
      [
        makeStrAttr('long_name', 'Interference fringes'),
        makeStrAttr('interpretation', 'image'),
      ]
    ),
    makeSimpleDataset('oneD_errors', intType, [41]),
  ],
  datatypes: [makeDatatype('datatype', compoundType)],
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
