import React, { useEffect, useState } from 'react';
import { HDF5Link } from '../providers/models';
import { buildTree } from './utils';
import { Tree, TreeNode } from './models';
import TreeView from './TreeView';
import styles from './Explorer.module.css';
import Icon from './Icon';
import { MockHDF5Metadata } from '../../demo-app/mock-data/models';

interface Props {
  filename: string;
  metadata: MockHDF5Metadata;
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
        isRoot
        onSelect={setSelectedNode}
        renderIcon={(data, isBranch, isExpanded) => (
          <Icon data={data} isBranch={isBranch} isExpanded={isExpanded} />
        )}
      />
    </div>
  );
}

export default Explorer;
