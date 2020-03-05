import { createContext } from 'react';
import { HDF5Link, HDF5Entity, HDF5HardLink } from './models';
import { Tree } from '../explorer/models';

interface DataProvider {
  getDomain: () => string;
  getMetadataTree: () => Promise<Tree<HDF5Link>>;
  getEntity: (link: HDF5Link) => Promise<HDF5Entity | undefined>;
  getValue: (link: HDF5HardLink) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function missing(): never {
  throw new Error(
    'Missing data provider context; please wrap `<H5Web />` with one of the available providers.'
  );
}

export const DataProviderContext = createContext<DataProvider>({
  getDomain: missing as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  getMetadataTree: missing as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  getEntity: missing as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  getValue: missing as any, // eslint-disable-line @typescript-eslint/no-explicit-any
});
