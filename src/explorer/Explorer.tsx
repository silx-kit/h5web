import React, { useEffect, useState } from 'react';
import { HDF5Metadata, HDF5Link } from '../models/metadata';
import { buildTree } from './utils';
import { Tree, TreeNode } from './models';
import TreeView from './TreeView';

import styles from './Explorer.module.css';

interface Props {
  filename: string;
  metadata: HDF5Metadata;
  onSelect: (link: HDF5Link) => void;
}

function Explorer(props: Props): JSX.Element {
  const { filename, metadata, onSelect } = props;
  const [tree, setTree] = useState<Tree<HDF5Link>>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode<HDF5Link>>();

  useEffect(() => {
    setTree(buildTree(metadata));
  }, [metadata]);

  useEffect(() => {
    if (selectedNode) {
      onSelect(selectedNode.data);
    }
  }, [selectedNode, onSelect]);

  return (
    <div className={styles.explorer}>
      <p className={styles.filename}>{filename}</p>

      <TreeView
        nodes={tree}
        selectedNode={selectedNode}
        onSelect={setSelectedNode}
        isRoot
      />
    </div>
  );
}

export default Explorer;
