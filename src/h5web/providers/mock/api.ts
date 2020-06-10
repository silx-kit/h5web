import type { ProviderAPI } from '../context';
import type { MockHDF5Metadata } from './models';
import {
  HDF5Collection,
  HDF5Entity,
  HDF5Value,
  HDF5Group,
  HDF5Dataset,
  HDF5Metadata,
  HDF5Id,
} from '../models';

/**
 * File mocked: `bsa_002_000-integrate-sub.h5`
 *
 * Datasets removed for faster tests:
 * - /entry_0000/2_buffer_subtraction/results/intensity_normed (id = 388a7055-5e02-11ea-88b6-478d93326ed6)
 * - /entry_0000/2_buffer_subtraction/results/intensity_std (id = 388a7056-5e02-11ea-88b6-478d93326ed6)
 * - /entry_0000/3_azimuthal_integration/results/I (id = 388a705f-5e02-11ea-88b6-478d93326ed6)
 * - /entry_0000/3_azimuthal_integration/results/errors (id = 388a7060-5e02-11ea-88b6-478d93326ed6)
 * - /entry_0000/3_azimuthal_integration/results/q (id = 388a7061-5e02-11ea-88b6-478d93326ed6)
 *
 * Datasets added :
 * - /nD/oneD
 * - /nD/twoD
 * - /nD/threeD
 * - /nD/fourD
 */
import mockData from './data.json';

function addMissingProperties<T extends HDF5Entity>(
  collection: HDF5Collection
) {
  return ([id, entity]: [string, Partial<T> & { value?: HDF5Value }]) => [
    id,
    { id, collection, ...entity },
  ];
}

export class MockApi implements ProviderAPI {
  constructor(private readonly domain: string) {}

  public getDomain(): string {
    return this.domain;
  }

  public async getMetadata(): Promise<HDF5Metadata> {
    const typedMockData = mockData as MockHDF5Metadata;

    return {
      ...typedMockData,
      groups: Object.fromEntries(
        Object.entries(typedMockData.groups).map(
          addMissingProperties<HDF5Group>(HDF5Collection.Groups)
        )
      ),
      datasets: Object.fromEntries(
        Object.entries(typedMockData.datasets || {}).map(
          addMissingProperties<HDF5Dataset>(HDF5Collection.Datasets)
        )
      ),
      datatypes: Object.fromEntries(
        Object.entries(typedMockData.datatypes || {}).map(
          addMissingProperties<HDF5Dataset>(HDF5Collection.Datasets)
        )
      ),
    };
  }

  public async getValue(id: HDF5Id): Promise<HDF5Value> {
    return (mockData as any).datasets[id].value; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}
