import React, { ReactNode } from 'react';
import { DataProviderContext } from '../context';
import { buildTree } from './utils';
import { TreeNode } from '../../explorer/models';
import { HDF5Link, HDF5HardLink, HDF5GenericEntity } from '../models';
import { isHardLink } from '../type-guards';
import { SilxApi } from './api';

interface Props {
  api: SilxApi;
  children: ReactNode;
}

function SilxProvider(props: Props): JSX.Element {
  const { api, children } = props;

  function getDomain(): string {
    return api.getDomain();
  }

  async function getMetadataTree(): Promise<TreeNode<HDF5Link>> {
    const metadata = await api.getMetadata();
    return buildTree(metadata);
  }

  async function getEntity(
    link: HDF5Link
  ): Promise<HDF5GenericEntity | undefined> {
    if (!isHardLink(link)) {
      return undefined;
    }

    const { collection, id } = link;
    const metadata = await api.getMetadata();
    const dict = metadata[collection];

    if (!dict) {
      return undefined;
    }

    return {
      id,
      collection,
      ...dict[id],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function getValue(hardLink: HDF5HardLink): Promise<any> {
    const values = await api.getValues();
    return values[hardLink.id];
  }

  return (
    <DataProviderContext.Provider
      value={{ getDomain, getMetadataTree, getEntity, getValue }}
    >
      {children}
    </DataProviderContext.Provider>
  );
}

export default SilxProvider;
