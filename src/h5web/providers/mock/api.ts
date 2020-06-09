import type { ProviderAPI } from '../context';
import type { HDF5Id, HDF5Value, HDF5Metadata } from '../models';

/**
 * File mocked: `bsa_002_000-integrate-sub.h5`
 *
 * Datasets removed for faster tests:
 * - /entry_0000/2_buffer_subtraction/results/intensity_normed (id = 388a7055-5e02-11ea-88b6-478d93326ed6)
 * - /entry_0000/2_buffer_subtraction/results/intensity_std (id = 388a7056-5e02-11ea-88b6-478d93326ed6)
 * - /entry_0000/3_azimuthal_integration/results/I (id = 388a705f-5e02-11ea-88b6-478d93326ed6)
 * - /entry_0000/3_azimuthal_integration/results/errors (id = 388a7060-5e02-11ea-88b6-478d93326ed6)
 * - /entry_0000/3_azimuthal_integration/results/q (id = 388a7061-5e02-11ea-88b6-478d93326ed6)
 */
import mockData from './data.json';

export class MockApi implements ProviderAPI {
  constructor(private readonly domain: string) {}

  public getDomain(): string {
    return this.domain;
  }

  public async getMetadata(): Promise<HDF5Metadata> {
    return mockData as HDF5Metadata;
  }

  public async getValue(id: HDF5Id): Promise<HDF5Value> {
    return (mockData as any).datasets[id].value; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}
