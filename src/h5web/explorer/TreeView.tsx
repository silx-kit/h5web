import React, { useState, useEffect } from 'react';
import { TreeNode } from './models';

import styles from './Explorer.module.css';

type ExpandedNodes = Record<string, boolean>;

interface Props<T> {
  nodes: TreeNode<T>[];
  defaultPath: number[];
  selectedNode?: TreeNode<T>;
  onSelect: (node: TreeNode<T>) => void;
  renderIcon: (data: T, isBranch: boolean, isExpanded: boolean) => JSX.Element;
}

function TreeView<T>(props: Props<T>): JSX.Element {
  const { nodes, defaultPath, selectedNode, onSelect, renderIcon } = props;

  // Find first node in default path, if any
  const defaultNode = nodes[defaultPath[0] ?? -1];

  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>(
    defaultNode && defaultNode.children ? { [defaultNode.uid]: true } : {}
  );

  useEffect(() => {
    // Select default node if last in default path
    if (defaultNode && defaultPath.length === 1) {
      onSelect(defaultNode);
    }
  }, [defaultNode, defaultPath, onSelect]);

  return (
    <ul className={styles.group} role="group">
      {nodes.map(node => {
        const { uid, label, level, data, children } = node;
        const isBranch = !!children;
        const isExpanded = !!expandedNodes[node.uid];
        const isSelected = node === selectedNode;

        return (
          <li
            key={uid}
            style={{ '--level': level } as React.CSSProperties}
            role="none"
          >
            <button
              className={styles.btn}
              type="button"
              role="treeitem"
              aria-expanded={isExpanded}
              aria-selected={isSelected}
              onClick={() => {
                onSelect(node);

                if (isBranch && (!isExpanded || isSelected)) {
                  setExpandedNodes({
                    ...expandedNodes,
                    [node.uid]: !isExpanded,
                  });
                }
              }}
            >
              {renderIcon(data, isBranch, isExpanded)}
              {label}
            </button>

            {children && isExpanded && (
              <TreeView
                nodes={children}
                defaultPath={defaultPath.slice(1)} // slice default path relevant to sub-tree
                selectedNode={selectedNode}
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
