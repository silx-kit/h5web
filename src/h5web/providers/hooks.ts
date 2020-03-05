import { useState, useEffect, useContext } from 'react';
import { HDF5Link, HDF5HardLink, HDF5Entity } from './models';
import { Tree } from '../explorer/models';
import { DataProviderContext } from './context';

export function useMetadataTree(): Tree<HDF5Link> {
  const { getMetadataTree } = useContext(DataProviderContext);
  const [tree, setTree] = useState<Tree<HDF5Link>>([]);

  useEffect(() => {
    getMetadataTree().then(setTree);
  }, [getMetadataTree]);

  return tree;
}

export function useEntity(link: HDF5Link): HDF5Entity | undefined {
  const { getEntity } = useContext(DataProviderContext);
  const [entity, setEntity] = useState<HDF5Entity | undefined>();

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
