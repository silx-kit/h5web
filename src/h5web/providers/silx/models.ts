import { HDF5Metadata, HDF5Value } from '../models';

export type SilxMetadataResponse = HDF5Metadata;
export type SilxValuesResponse = Record<string, HDF5Value>;
