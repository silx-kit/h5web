import React from 'react';
import { FiSidebar, FiChevronRight } from 'react-icons/fi';
import styles from './BreadcrumbsBar.module.css';
import { TreeNode } from './explorer/models';
import { HDF5Link, HDF5HardLink } from './providers/models';

interface Props {
  isExplorerOpen: boolean;
  onToggleExplorer: () => void;
  isInspecting: boolean;
  onSetInspecting: (b: boolean) => void;
  selectedNode?: TreeNode<HDF5Link>;
}

function BreadcrumbsBar(props: Props): JSX.Element {
  const {
    isExplorerOpen,
    onToggleExplorer,
    isInspecting,
    onSetInspecting,
    selectedNode,
  } = props;

  // Excludes the first parent (the domain) if the explorer is opened
  const firstParentIndex = isExplorerOpen ? 1 : 0;

  return (
    <div className={styles.bar}>
      <button
        className={styles.sidebarBtn}
        type="button"
        aria-label="Toggle explorer sidebar"
        aria-pressed={isExplorerOpen}
        onClick={onToggleExplorer}
      >
        <FiSidebar />
      </button>
      {selectedNode && (
        <div className={styles.breadCrumbs}>
          {selectedNode?.parents.slice(firstParentIndex).map(member => (
            <>
              <span className={styles.crumb} key={(member as HDF5HardLink).id}>
                {member.title}
              </span>
              <FiChevronRight />
            </>
          ))}
          <span className={styles.crumb} data-current>
            {selectedNode.data.title}
          </span>
        </div>
      )}
      <div role="tablist" className={styles.modeToggler}>
        <button
          type="button"
          role="tab"
          className={styles.btn}
          aria-selected={!isInspecting}
          onClick={() => onSetInspecting(false)}
        >
          Display
        </button>
        <button
          type="button"
          role="tab"
          className={styles.btn}
          aria-selected={isInspecting}
          onClick={() => onSetInspecting(true)}
        >
          Inspect
        </button>
      </div>
    </div>
  );
}

export default BreadcrumbsBar;
