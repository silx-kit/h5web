import { useState, useEffect } from 'react';
import { HDF5Link, HDF5HardLink, HDF5Entity } from './models';
import mockMetadata from '../../demo-app/mock-data/metadata.json';
import mockValues from '../../demo-app/mock-data/values.json';
import {
  MockHDF5Metadata,
  MockHDF5Values,
} from '../../demo-app/mock-data/models';
import { isHardLink } from './type-guards';
import { buildTree } from '../explorer/utils';
import { Tree } from '../explorer/models';

export function useMetadataTree(): Tree<HDF5Link> {
  const [tree, setTree] = useState<Tree<HDF5Link>>([]);

  useEffect(() => {
    setTree(buildTree(mockMetadata as MockHDF5Metadata));
  }, []);

  return tree;
}

export function useEntityMetadata(link: HDF5Link): HDF5Entity | undefined {
  if (!isHardLink(link)) {
    return undefined;
  }

  const { collection, id } = link;
  return (mockMetadata as MockHDF5Metadata)[collection]![id]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
}

export function useValues(link: HDF5HardLink): MockHDF5Values {
  const { id } = link;
  return (mockValues as MockHDF5Values)[id];
}
