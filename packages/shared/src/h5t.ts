/* ------------------- */
/* ---- H5T ENUMS ---- */

// https://docs.hdfgroup.org/hdf5/v1_14/_h5_tpublic_8h.html#title3

export enum H5T_CLASS {
  INTEGER = 0,
  FLOAT = 1,
  TIME = 2,
  STRING = 3,
  BITFIELD = 4,
  OPAQUE = 5,
  COMPOUND = 6,
  REFERENCE = 7,
  ENUM = 8,
  VLEN = 9,
  ARRAY = 10,
}

export enum H5T_ORDER {
  LE = 0,
  BE = 1,
  VAX = 2,
  MIXED = 3,
  NONE = 4,
}

export enum H5T_SIGN {
  NONE = 0, // unsigned
  SIGN_2 = 1, // signed
  NSGN = 2,
}

export enum H5T_CSET {
  ASCII = 0,
  UTF8 = 1,
}

export enum H5T_STR {
  NULLTERM = 0,
  NULLPAD = 1,
  SPACEPAD = 2,
}

/* ---------------------- */
/* ---- H5T MAPPINGS ---- */

export const H5T_TO_ENDIANNESS = {
  [H5T_ORDER.LE]: 'little-endian',
  [H5T_ORDER.BE]: 'big-endian',
  [H5T_ORDER.VAX]: 'VAX',
  [H5T_ORDER.MIXED]: 'mixed',
  [H5T_ORDER.NONE]: 'none',
} as const;

export const H5T_TO_CHAR_SET = {
  [H5T_CSET.ASCII]: 'ASCII',
  [H5T_CSET.UTF8]: 'UTF-8',
} as const;

export const H5T_TO_STR_PAD = {
  [H5T_STR.NULLTERM]: 'null-terminated',
  [H5T_STR.NULLPAD]: 'null-padded',
  [H5T_STR.SPACEPAD]: 'space-padded',
} as const;
