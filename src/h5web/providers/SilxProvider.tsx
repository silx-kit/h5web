import React, { ReactNode } from 'react';
import { DataProviderContext } from './context';
import { buildTree } from '../explorer/utils';
import { Tree } from '../explorer/models';
import { HDF5Link, HDF5Entity, HDF5HardLink } from './models';
import mockMetadata from '../../demo-app/mock-data/metadata.json';
import mockValues from '../../demo-app/mock-data/values.json';
import {
  MockHDF5Metadata,
  MockHDF5Values,
} from '../../demo-app/mock-data/models';
import { isHardLink } from './type-guards';

// const ROOT_URL = 'http://www.silx.org/pub/h5web/';

interface Props {
  domain: string;
  children: ReactNode;
}

function SilxProvider(props: Props): JSX.Element {
  const { children } = props;

  async function getMetadataTree(): Promise<Tree<HDF5Link>> {
    return buildTree(mockMetadata as MockHDF5Metadata);
  }

  async function getEntity(link: HDF5Link): Promise<HDF5Entity | undefined> {
    if (!isHardLink(link)) {
      return undefined;
    }

    const { collection, id } = link;
    return (mockMetadata as MockHDF5Metadata)[collection]![id]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function getValue(hardLink: HDF5HardLink): Promise<any> {
    const { id } = hardLink;
    return (mockValues as MockHDF5Values)[id];
  }

  return (
    <DataProviderContext.Provider
      value={{ getMetadataTree, getEntity, getValue }}
    >
      {children}
    </DataProviderContext.Provider>
  );
}

export default SilxProvider;
