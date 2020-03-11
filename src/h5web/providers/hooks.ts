import { useState, useEffect, useContext } from 'react';
import { HDF5Link, HDF5HardLink, HDF5GenericEntity } from './models';
import { TreeNode } from '../explorer/models';
import { DataProviderContext } from './context';

export function useDomain(): string {
  const { getDomain } = useContext(DataProviderContext);
  return getDomain();
}

export function useMetadataTree(): TreeNode<HDF5Link> | undefined {
  const { getMetadataTree } = useContext(DataProviderContext);
  const [tree, setTree] = useState<TreeNode<HDF5Link>>();

  useEffect(() => {
    getMetadataTree().then(setTree);
  }, [getMetadataTree]);

  return tree;
}

export function useEntity(link: HDF5Link): HDF5GenericEntity | undefined {
  const { getEntity } = useContext(DataProviderContext);
  const [entity, setEntity] = useState<HDF5GenericEntity | undefined>();

  useEffect(() => {
    getEntity(link).then(setEntity);
  }, [link, getEntity]);

  return entity;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useValue(hardLink: HDF5HardLink): any {
  const { getValue } = useContext(DataProviderContext);
  const [value, setValue] = useState<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    getValue(hardLink).then(setValue);
  }, [hardLink, getValue]);

  return value;
}
