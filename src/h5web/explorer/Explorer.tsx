import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  ReactElement,
} from 'react';
import { FiFileText } from 'react-icons/fi';
import type { HDF5Link } from '../providers/models';
import type { TreeNode, ExpandedNodes } from './models';
import TreeView from './TreeView';
import styles from './Explorer.module.css';
import Icon from './Icon';
import { buildTree, getNodesOnPath } from './utils';
import { ProviderContext } from '../providers/context';

const DEFAULT_PATH: number[] = JSON.parse(
  process.env.REACT_APP_DEFAULT_PATH || '[]'
);

interface Props {
  onSelect: (node: TreeNode<HDF5Link>) => void;
  selectedNode?: TreeNode<HDF5Link>;
}

function Explorer(props: Props): ReactElement {
  const { onSelect, selectedNode } = props;

  const { domain, metadata } = useContext(ProviderContext);
  const tree = useMemo(() => buildTree(metadata, domain), [domain, metadata]);

  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});

  function handleNodeSelect(node: TreeNode<HDF5Link>): void {
    const isBranch = !!node.children;
    const isExpanded = !!expandedNodes[node.uid];
    const isSelected = node === selectedNode;

    onSelect(node);

    if (isBranch && (!isExpanded || isSelected)) {
      setExpandedNodes({
        ...expandedNodes,
        [node.uid]: !isExpanded,
      });
    }
  }

  useEffect(() => {
    // Get nodes on default path
    const nodes = getNodesOnPath(tree, DEFAULT_PATH);

    // Select last node in path, or root node of tree if default path was empty
    const nodeToSelect = nodes[nodes.length - 1] || tree;
    onSelect(nodeToSelect);

    // Expand nodes on default path, excluding last node if not a branch
    const nodesToExpand = nodeToSelect.children ? nodes : nodes.slice(0, -1);
    setExpandedNodes(
      nodesToExpand.reduce((acc, node) => ({ ...acc, [node.uid]: true }), {})
    );
  }, [onSelect, tree]);

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
          level={0}
          nodes={tree.children}
          selectedNode={selectedNode}
          expandedNodes={expandedNodes}
          onSelect={handleNodeSelect}
          renderIcon={(data, isBranch, isExpanded) => (
            <Icon data={data} isBranch={isBranch} isExpanded={isExpanded} />
          )}
        />
      )}
    </div>
  );
}

export default Explorer;
