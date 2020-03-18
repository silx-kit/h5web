import { createContext } from 'react';
import { HDF5Id, HDF5Value, HDF5Metadata } from './models';

export abstract class ProviderAPI {
  abstract getDomain: () => string;
  abstract getMetadata: () => Promise<HDF5Metadata>;
  abstract getValue: (id: HDF5Id) => Promise<HDF5Value>;
}

function missing(): never {
  throw new Error(
    'Missing data provider context; please wrap `<H5Web />` with one of the available providers.'
  );
}

export const ProviderContext = createContext<ProviderAPI>({
  getDomain: missing as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  getMetadata: missing as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  getValue: missing as any, // eslint-disable-line @typescript-eslint/no-explicit-any
});
