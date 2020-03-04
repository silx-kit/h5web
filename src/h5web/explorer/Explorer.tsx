import React, { useEffect, useState } from 'react';
import { HDF5Link } from '../providers/models';
import { TreeNode } from './models';
import TreeView from './TreeView';
import styles from './Explorer.module.css';
import Icon from './Icon';
import { useMetadataTree } from '../providers/hooks';

interface Props {
  filename: string;
  onSelect: (link: HDF5Link) => void;
}

function Explorer(props: Props): JSX.Element {
  const { filename, onSelect } = props;
  const tree = useMetadataTree();

  const [selectedNode, setSelectedNode] = useState<TreeNode<HDF5Link>>();

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
