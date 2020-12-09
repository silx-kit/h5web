import React, { Fragment, ReactElement } from 'react';
import { FiSidebar, FiChevronRight } from 'react-icons/fi';
import styles from './BreadcrumbsBar.module.css';
import type { MyHDF5Entity } from './providers/models';
import ToggleGroup from './toolbar/controls/ToggleGroup';
import ToggleBtn from './toolbar/controls/ToggleBtn';
import { getParents } from './explorer/utils';

interface Props {
  isExplorerOpen: boolean;
  onToggleExplorer: () => void;
  isInspecting: boolean;
  onChangeInspecting: (b: boolean) => void;
  selectedEntity?: MyHDF5Entity;
}

function BreadcrumbsBar(props: Props): ReactElement {
  const {
    isExplorerOpen,
    onToggleExplorer,
    isInspecting,
    onChangeInspecting,
    selectedEntity,
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
      {selectedEntity && (
        <h1 className={styles.breadCrumbs}>
          {getParents(selectedEntity)
            .slice(firstParentIndex)
            .map((parent) => (
              <Fragment key={parent.id}>
                <span className={styles.crumb}>{parent.name}</span>
                <FiChevronRight className={styles.separator} title="/" />
              </Fragment>
            ))}
          <span className={styles.crumb} data-current>
            {selectedEntity.name}
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
