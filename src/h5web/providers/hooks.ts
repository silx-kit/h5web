import { useState, useEffect, useContext } from 'react';
import type { HDF5Link, HDF5Entity } from './models';
import type { TreeNode } from '../explorer/models';
import { ProviderContext } from './context';
import { buildTree, isReachable } from './utils';

export function useDomain(): string {
  const { getDomain } = useContext(ProviderContext);
  return getDomain();
}

export function useMetadataTree(): TreeNode<HDF5Link> | undefined {
  const { getMetadata } = useContext(ProviderContext);
  const [tree, setTree] = useState<TreeNode<HDF5Link>>();
  const domain = useDomain();

  useEffect(() => {
    getMetadata()
      .then((metadata) => buildTree(metadata, domain))
      .then(setTree);
  }, [domain, getMetadata]);

  return tree;
}

export function useEntity(link?: HDF5Link): HDF5Entity | undefined {
  const { getMetadata } = useContext(ProviderContext);
  const [entity, setEntity] = useState<HDF5Entity>();

  useEffect(() => {
    if (!link || !isReachable(link)) {
      setEntity(undefined);
      return;
    }

    getMetadata().then((metadata) => {
      const { collection, id } = link;
      const dict = metadata[collection];
      setEntity(dict && dict[id]);
    });
  }, [link, getMetadata]);

  return entity;
}
