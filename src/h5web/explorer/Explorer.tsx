import React, { useEffect, useState } from 'react';
import { FiFileText } from 'react-icons/fi';
import { HDF5Link } from '../providers/models';
import { TreeNode } from './models';
import TreeView from './TreeView';
import styles from './Explorer.module.css';
import Icon from './Icon';
import { useMetadataTree, useDomain } from '../providers/hooks';

interface Props {
  onSelect: (link: HDF5Link) => void;
}

function Explorer(props: Props): JSX.Element {
  const { onSelect } = props;

  const domain = useDomain();
  const tree = useMetadataTree();

  const [selectedNode, setSelectedNode] = useState<TreeNode<HDF5Link>>();

  useEffect(() => {
    if (tree) {
      // Select root node when tree is ready
      setSelectedNode(tree);
    }
  }, [tree]);

  useEffect(() => {
    if (selectedNode) {
      // Propagate selected link to parent component
      onSelect(selectedNode.data);
    }
  }, [selectedNode, onSelect]);

  if (!tree) {
    return (
      <div className={styles.explorer}>
        <p className={styles.domain}>
          <FiFileText className={styles.domainIcon} />
          {domain}
        </p>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.explorer} role="tree">
      <button
        className={styles.domainBtn}
        type="button"
        role="treeitem"
        aria-selected={selectedNode === tree}
        onClick={() => {
          setSelectedNode(tree);
        }}
      >
        <FiFileText className={styles.domainIcon} />
        {domain}
      </button>

      {tree.children && (
        <TreeView
          nodes={tree.children}
          selectedNode={selectedNode}
          onSelect={setSelectedNode}
          renderIcon={(data, isBranch, isExpanded) => (
            <Icon data={data} isBranch={isBranch} isExpanded={isExpanded} />
          )}
        />
      )}
    </div>
  );
}

export default Explorer;
