import React, { useEffect } from 'react';
import { FiFileText } from 'react-icons/fi';
import { HDF5Link } from '../providers/models';
import { TreeNode } from './models';
import TreeView from './TreeView';
import styles from './Explorer.module.css';
import Icon from './Icon';
import { useDomain, useMetadataTree } from '../providers/hooks';

const DEFAULT_PATH: number[] = JSON.parse(
  process.env.REACT_APP_DEFAULT_PATH || '[]'
);

interface Props {
  onSelect: (node: TreeNode<HDF5Link>) => void;
  selectedNode?: TreeNode<HDF5Link>;
}

function Explorer(props: Props): JSX.Element {
  const { onSelect, selectedNode } = props;

  const domain = useDomain();
  const tree = useMetadataTree();

  useEffect(() => {
    if (tree && DEFAULT_PATH.length === 0) {
      // Select root node when tree is ready and default path is empty
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
          defaultPath={DEFAULT_PATH}
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
