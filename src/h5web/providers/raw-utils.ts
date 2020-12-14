import { SilxStyle } from '../visualizations/nexus/models';
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
} from './models';

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
  length: 'H5T_VARIABLE',
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

export function makeStrAttr(name: string, value: string): HDF5Attribute {
  return makeAttr(name, scalarShape, stringType, value);
}

/* -------------------- */
/* ----- ENTITIES ----- */

export function makeDataset(
  type: HDF5Type,
  shape: HDF5Shape,
  attributes?: HDF5Attribute[]
): HDF5Dataset {
  return { type, shape, attributes };
}

export function makeSimpleDataset(
  type: HDF5Type,
  dims: HDF5Dims,
  attributes?: HDF5Attribute[]
): HDF5Dataset {
  return makeDataset(type, makeSimpleShape(dims), attributes);
}

export function makeGroup(
  attributes?: HDF5Attribute[],
  links?: HDF5Link[]
): HDF5Group {
  return { attributes, links };
}

export function makeDatatype(type: HDF5Type): HDF5Datatype {
  return { type };
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

export function makeNxAxesAttr(axes: string[]): HDF5Attribute {
  return makeAttr('axes', makeSimpleShape([axes.length]), stringType, axes);
}

export function makeSilxStyleAttr(style: SilxStyle): HDF5Attribute {
  const { signalScaleType, axesScaleType } = style;

  return makeStrAttr(
    'SILX_style',
    JSON.stringify({
      signal_scale_type: signalScaleType,
      axes_scale_type: axesScaleType,
    })
  );
}

/* -------------------- */
/* ----- METADATA ----- */

export function makeMetadata(
  opts: {
    root?: HDF5Id;
    datasets?: Record<HDF5Id, HDF5Dataset>;
    groups?: Record<HDF5Id, HDF5Group>;
    datatypes?: Record<HDF5Id, HDF5Datatype>;
  } = {}
): HDF5Metadata {
  const { root = '', datasets = {}, groups = {}, datatypes = {} } = opts;
  return { root, datasets, groups, datatypes };
}
