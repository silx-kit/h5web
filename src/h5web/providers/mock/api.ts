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
 * See https://gist.github.com/loichuder/b3fc75ad55d939fbe33ff96c8366b2c5
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
  constructor(public readonly domain: string) {}

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

  public async getValue(id: HDF5Id): Promise<HDF5Value | undefined> {
    return (mockData as any).datasets[id].value; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}
