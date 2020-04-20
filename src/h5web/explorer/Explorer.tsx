import React, { useEffect } from 'react';
import { FiFileText } from 'react-icons/fi';
import { HDF5Link } from '../providers/models';
import { TreeNode } from './models';
import TreeView from './TreeView';
import styles from './Explorer.module.css';
import Icon from './Icon';
import { useDomain, useMetadataTree } from '../providers/hooks';

interface Props {
  onSelect: (node: TreeNode<HDF5Link>) => void;
  selectedNode?: TreeNode<HDF5Link>;
}

function Explorer(props: Props): JSX.Element {
  const { onSelect, selectedNode } = props;

  const domain = useDomain();
  const tree = useMetadataTree();

  useEffect(() => {
    if (tree) {
      // Select root node when tree is ready
      onSelect(tree);
    }
  }, [onSelect, tree]);

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
          onSelect(tree);
        }}
      >
        <FiFileText className={styles.domainIcon} />
        {domain}
      </button>

      {tree.children && (
        <TreeView
          nodes={tree.children}
          selectedNode={selectedNode}
          onSelect={onSelect}
          renderIcon={(data, isBranch, isExpanded) => (
            <Icon data={data} isBranch={isBranch} isExpanded={isExpanded} />
          )}
        />
      )}
    </div>
  );
}

export default Explorer;
