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

export function makeSimpleDataset(
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

export function makeDatatype(id: HDF5Id, type: HDF5Type): HDF5Datatype {
  return { id, collection: HDF5Collection.Datatypes, type };
}

export function withAttributes<T extends HDF5Dataset | HDF5Group>(
  datasetOrGroup: T,
  attributes: HDF5Attribute[]
): T {
  return {
    ...datasetOrGroup,
    attributes: [...(datasetOrGroup.attributes || []), ...attributes],
  };
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

export function makeDatasetHardLink(title: string, id = title): HDF5HardLink {
  return makeHardLink(HDF5Collection.Datasets, title, id);
}

export function makeGroupHardLink(title: string, id = title): HDF5HardLink {
  return makeHardLink(HDF5Collection.Groups, title, id);
}

export function makeExternalLink(
  title: string,
  file: string,
  h5path: string
): HDF5ExternalLink {
  return { class: HDF5LinkClass.External, title, file, h5path };
}

/* ----------------- */
/* ----- NEXUS ----- */

export function makeNxData(
  id: string,
  opts: {
    signal: string;
    axes?: string | string[];
    ids?: Record<string, HDF5Id>;
  }
): HDF5Group {
  const { signal, axes, ids = {} } = opts;

  return makeGroup(
    id,
    [
      makeStrAttr('NX_class', 'NXdata'),
      makeStrAttr('signal', signal),
      ...(axes ? [makeStrAttr('axes', axes)] : []),
    ],
    Object.entries(ids).map(([...args]) => makeDatasetHardLink(...args))
  );
}

export function makeNxEntry(
  id: string,
  opts: {
    defaultPath?: string;
    ids?: Record<string, HDF5Id>;
  }
): HDF5Group {
  const { ids = {}, defaultPath } = opts;

  return makeGroup(
    id,
    [makeStrAttr('NX_class', 'NXentry'), makeStrAttr('default', defaultPath)],
    Object.entries(ids).map(([...args]) => makeGroupHardLink(...args))
  );
}

export function makeNxRoot(
  id: string,
  opts: {
    defaultPath?: string;
    ids?: Record<string, HDF5Id>;
  }
): HDF5Group {
  const { ids = {}, defaultPath } = opts;

  return makeGroup(
    id,
    [makeStrAttr('NX_class', 'NXroot'), makeStrAttr('default', defaultPath)],
    Object.entries(ids).map(([...args]) => makeGroupHardLink(...args))
  );
}

export function makeNxAxesAttr(axes: string[]): HDF5Attribute {
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
        makeStrAttr('signal', 'oneD'),
        makeStrAttr('interpretation', 'spectrum'),
        makeNxAxesAttr(['X']),
      ],
      [
        makeDatasetHardLink('oneD'),
        makeDatasetHardLink('X'),
        makeDatasetHardLink('errors', 'errors_oneD'),
      ]
    ),
    makeGroup(
      'image',
      [
        makeStrAttr('NX_class', 'NXdata'),
        makeStrAttr('signal', 'fourD'),
        makeStrAttr('interpretation', 'image'),
        makeStrAttr('SILX_style', JSON.stringify({ signal_scale_type: 'log' })),
        makeNxAxesAttr(['.', '.', 'Y', 'X']),
      ],
      [
        makeDatasetHardLink('fourD'),
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
        makeStrAttr('interpretation', 'spectrum'),
        makeNxAxesAttr(['X_log']),
      ],
      [makeDatasetHardLink('oneD', 'oneD'), makeDatasetHardLink('X_log')]
    ),
  ],
  datasets: [
    makeSimpleDataset('oneD_linear', intType, [41]),
    makeSimpleDataset(
      'oneD',
      intType,
      [41],
      [makeStrAttr('units', 'arb. units')]
    ),
    makeSimpleDataset('twoD', intType, [20, 41]),
    makeSimpleDataset('threeD', intType, [9, 20, 41]),
    makeSimpleDataset(
      'fourD',
      intType,
      [3, 9, 20, 41],
      [makeStrAttr('long_name', 'Interference fringes')]
    ),
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
    makeSimpleDataset('errors_oneD', floatType, [41]),
    makeSimpleDataset('X_log', floatType, [41]),
  ],
  datatypes: [makeDatatype('datatype', compoundType)],
});

/* ------------------ */
/* ----- VALUES ----- */

const arr1 = range(-20, 21);
const arr2 = range(0, 100, 5);
const arr3 = range(-1, 1.25, 0.25);
const arr4 = range(10, 40, 10);

const oneD = arr1.map((val) => val ** 3);
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
  raw: { int: 42 },
  scalar_int: 0,
  scalar_str: 'foo',
  oneD_linear: arr1,
  oneD,
  twoD,
  threeD,
  fourD,
  X: arr1,
  Y: arr2,
  X_log: arr1.map((_, i) => (i + 1) * 0.1),
  title_twoD: 'NeXus 2D',
  errors_oneD: arr1.map(Math.abs),
};
