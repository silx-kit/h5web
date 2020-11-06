import React, { Fragment, ReactElement } from 'react';
import { FiSidebar, FiChevronRight } from 'react-icons/fi';
import styles from './BreadcrumbsBar.module.css';
import type { TreeNode } from './explorer/models';
import type { HDF5Link, HDF5HardLink } from './providers/models';
import ToggleGroup from './toolbar/controls/ToggleGroup';
import ToggleBtn from './toolbar/controls/ToggleBtn';

interface Props {
  isExplorerOpen: boolean;
  onToggleExplorer: () => void;
  isInspecting: boolean;
  onChangeInspecting: (b: boolean) => void;
  selectedNode?: TreeNode<HDF5Link>;
}

function BreadcrumbsBar(props: Props): ReactElement {
  const {
    isExplorerOpen,
    onToggleExplorer,
    isInspecting,
    onChangeInspecting,
    selectedNode,
  } = props;

  // Excludes the first parent (the domain) if the explorer is opened
  const firstParentIndex = isExplorerOpen ? 1 : 0;

  return (
    <div className={styles.bar}>
      <ToggleBtn
        label="Toggle explorer sidebar"
        icon={FiSidebar}
        iconOnly
        value={isExplorerOpen}
        onChange={onToggleExplorer}
      />
      {selectedNode && (
        <h1 className={styles.breadCrumbs}>
          {selectedNode?.parents.slice(firstParentIndex).map((member) => (
            <Fragment key={(member as HDF5HardLink).id}>
              <span className={styles.crumb}>{member.title}</span>
              <FiChevronRight className={styles.separator} title="/" />
            </Fragment>
          ))}
          <span className={styles.crumb} data-current>
            {selectedNode.data.title}
          </span>
        </h1>
      )}
      <ToggleGroup
        role="tablist"
        ariaLabel="Viewer mode"
        value={String(isInspecting)}
        onChange={(val) => {
          onChangeInspecting(val === 'true' || false);
        }}
      >
        <ToggleGroup.Btn label="Display" value="false" />
        <ToggleGroup.Btn label="Inspect" value="true" />
      </ToggleGroup>
    </div>
  );
}

export default BreadcrumbsBar;
