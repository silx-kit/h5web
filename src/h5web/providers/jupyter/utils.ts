import { assertArray } from '../../guards';
import { HDF5Endianness, HDF5Type, HDF5TypeClass } from '../hdf5-models';
import { EntityKind } from '../models';
import type {
  JupyterContentGroupResponse,
  JupyterContentResponse,
  JupyterMetaDatasetResponse,
  JupyterMetaGroupResponse,
  JupyterMetaResponse,
} from './models';

export function isGroupResponse(
  response: JupyterMetaResponse
): response is JupyterMetaGroupResponse {
  return response.type === EntityKind.Group;
}
export function isDatasetResponse(
  response: JupyterMetaResponse
): response is JupyterMetaDatasetResponse {
  return response.type === EntityKind.Dataset;
}

export function assertGroupResponse(
  response: JupyterMetaResponse
): asserts response is JupyterMetaGroupResponse {
  if (!isGroupResponse(response)) {
    throw new Error('Expected group response');
  }
}

export function assertGroupContent(
  contents: JupyterContentResponse
): asserts contents is JupyterContentGroupResponse {
  assertArray(contents);
}

export function convertEndianness(endianness: string): HDF5Endianness {
  // https://numpy.org/doc/stable/reference/generated/numpy.dtype.byteorder.html#numpy.dtype.byteorder
  switch (endianness) {
    case '<':
      return 'LE';
    case '>':
      return 'BE';
    case '=':
      return 'Native';
    case '|':
      return 'Not applicable';
    default:
      throw new Error(`Unknown endianness symbol ${endianness}`);
  }
}

export function convertDtype(dtype: string): HDF5Type {
  const regexp = /([<>=|])?([A-z])(\d*)/u;
  const matches = regexp.exec(dtype);

  if (matches === null) {
    throw new Error(`Unknown dtype ${dtype}`);
  }

  const [, endianMatch, dataType, lengthMatch] = matches;

  const length = lengthMatch ? Number.parseInt(lengthMatch, 10) : 0;
  const endianness = convertEndianness(endianMatch);

  switch (dataType) {
    case 'f':
      return {
        class: HDF5TypeClass.Float,
        size: length * 8,
        endianness,
      };

    case 'i':
      return {
        class: HDF5TypeClass.Integer,
        size: length * 8,
        endianness,
      };

    case 'u':
      return {
        class: HDF5TypeClass.Integer,
        size: length * 8,
        endianness,
        unsigned: true,
      };

    case 'c':
      return {
        class: HDF5TypeClass.Compound,
        fields: [
          {
            name: 'real',
            type: {
              class: HDF5TypeClass.Float,
              size: length * 4, // Bytes are equally distributed between real and imag
              endianness,
            },
          },
          {
            name: 'imag',
            type: {
              class: HDF5TypeClass.Float,
              size: length * 4, // Bytes are equally distributed between real and imag
              endianness,
            },
          },
        ],
      };

    case 'S':
      return {
        class: HDF5TypeClass.String,
        charSet: 'H5T_CSET_ASCII',
        strPad: 'H5T_STR_NULLPAD',
        length: length || 'H5T_VARIABLE',
      };

    case 'U':
    case 'O': // TODO: objects are considered as strings for now
      return {
        class: HDF5TypeClass.String,
        charSet: 'H5T_CSET_UTF8',
        strPad: 'H5T_STR_NULLPAD',
        length: length || 'H5T_VARIABLE',
      };

    default:
      throw new Error(`Unknown dtype ${dtype}`);
  }
}
