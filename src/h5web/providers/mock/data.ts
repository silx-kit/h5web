import {
  HDF5Id,
  HDF5LinkClass,
  HDF5Collection,
  HDF5Attribute,
  HDF5Dataset,
  HDF5Metadata,
  HDF5Values,
  HDF5TypeClass,
  HDF5IntegerType,
  HDF5FloatType,
  HDF5StringType,
  HDF5AdvancedType,
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

export const advancedType: HDF5AdvancedType = {
  class: HDF5TypeClass.Compound,
  fields: [],
};

/* ------------------ */
/* ----- SHAPES ----- */

export const scalarShape: HDF5ScalarShape = { class: HDF5ShapeClass.Scalar };

export function makeSimpleShape(dims: HDF5Dims): HDF5SimpleShape {
  return { class: HDF5ShapeClass.Simple, dims };
}

/* ---------------------- */
/* ----- ATTRIBUTES ----- */

export function makeStrAttr(name: string, value: HDF5Value): HDF5Attribute {
  return { name, value, type: stringType, shape: scalarShape };
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

export function makeDatasetHardLink(title: string, id: string): HDF5HardLink {
  return {
    class: HDF5LinkClass.Hard,
    title,
    collection: HDF5Collection.Datasets,
    id,
  };
}

export function makeGroupHardLink(title: string, id: string): HDF5HardLink {
  return {
    class: HDF5LinkClass.Hard,
    title,
    collection: HDF5Collection.Groups,
    id,
  };
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

/* ------------------ */
/* ----- VALUES ----- */

export const mockValues: HDF5Values = {};
