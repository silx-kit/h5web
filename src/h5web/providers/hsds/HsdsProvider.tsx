import React, { ReactNode } from 'react';
import { DataProviderContext } from '../context';
import { buildTree } from '../silx/utils';
import { TreeNode } from '../../explorer/models';
import { HDF5GenericEntity, HDF5Link, HDF5Id, HDF5Value } from '../models';
import { isReachable } from '../type-guards';
import { HsdsApi } from './api';

interface Props {
  api: HsdsApi;
  children: ReactNode;
}

/* Provider of metadata and values by HSDS */
function HsdsProvider(props: Props): JSX.Element {
  const { api, children } = props;

  function getDomain(): string {
    return api.getDomain();
  }

  async function getMetadataTree(): Promise<TreeNode<HDF5Link>> {
    // Must return a nested JSON
    const metadata = await api.getMetadata();
    const tree = buildTree(metadata);
    return tree;
  }

  async function getEntity(
    link?: HDF5Link
  ): Promise<HDF5GenericEntity | undefined> {
    if (!link || !isReachable(link)) {
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

  async function getValue(id: HDF5Id): Promise<HDF5Value> {
    return api.getValue(id);
  }

  return (
    <DataProviderContext.Provider
      value={{ getDomain, getMetadataTree, getEntity, getValue }}
    >
      {children}
    </DataProviderContext.Provider>
  );
}

export default HsdsProvider;
