import React, { CSSProperties, ReactElement } from 'react';
import type { TreeNode, ExpandedNodes } from './models';

import styles from './Explorer.module.css';

interface Props<T> {
  level: number;
  nodes: TreeNode<T>[];
  selectedNode?: TreeNode<T>;
  expandedNodes: ExpandedNodes;
  onSelect: (node: TreeNode<T>) => void;
  renderIcon: (data: T, isBranch: boolean, isExpanded: boolean) => JSX.Element;
}

function TreeView<T>(props: Props<T>): ReactElement {
  const {
    level,
    nodes,
    selectedNode,
    expandedNodes,
    onSelect,
    renderIcon,
  } = props;

  return (
    <ul className={styles.group} role="group">
      {nodes.map((node) => {
        const { uid, label, data, children } = node;
        const isBranch = !!children;
        const isExpanded = !!expandedNodes[node.uid];

        return (
          <li
            key={uid}
            style={{ '--level': level } as CSSProperties}
            role="none"
          >
            <button
              className={styles.btn}
              type="button"
              role="treeitem"
              aria-expanded={isBranch ? isExpanded : undefined} // Leaves cannot be expanded
              aria-selected={node === selectedNode}
              onClick={() => {
                onSelect(node);
              }}
            >
              {renderIcon(data, isBranch, isExpanded)}
              {label}
            </button>

            {children && isExpanded && (
              <TreeView
                level={level + 1}
                nodes={children}
                selectedNode={selectedNode}
                expandedNodes={expandedNodes}
                onSelect={onSelect}
                renderIcon={renderIcon}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default TreeView;
