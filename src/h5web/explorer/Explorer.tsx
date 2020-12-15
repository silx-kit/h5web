import React, { useEffect, useContext, ReactElement } from 'react';
import { FiFileText } from 'react-icons/fi';
import type { MyHDF5Entity } from '../providers/models';
import EntityList from './EntityList';
import styles from './Explorer.module.css';
import { getEntityAtPath, getParents } from '../utils';
import { ProviderContext } from '../providers/context';
import { isGroup } from '../guards';
import { useSet } from 'react-use';

const DEFAULT_PATH = process.env.REACT_APP_DEFAULT_PATH || '/';

interface Props {
  onSelect: (entity: MyHDF5Entity) => void;
  selectedEntity?: MyHDF5Entity;
}

function Explorer(props: Props): ReactElement {
  const { onSelect, selectedEntity } = props;
  const { domain, metadata: root } = useContext(ProviderContext);

  const [
    expandedGroups,
    { add: expandGroup, toggle: toggleGroup },
  ] = useSet<string>();

  function handleSelect(entity: MyHDF5Entity): void {
    const isExpanded = expandedGroups.has(entity.uid);
    const isSelected = entity === selectedEntity;
    onSelect(entity);

    // Expand if collapsed; collapse is expanded and selected
    if (isGroup(entity) && (!isExpanded || isSelected)) {
      toggleGroup(entity.uid);
    }
  }

  useEffect(() => {
    // Find and select entity at default path
    const entityToSelect = getEntityAtPath(root, DEFAULT_PATH) || root;
    onSelect(entityToSelect);

    // Expand entity if group
    if (isGroup(entityToSelect)) {
      expandGroup(entityToSelect.uid);
    }

    // Expand parent groups
    getParents(entityToSelect).forEach((group) => expandGroup(group.uid));
  }, [expandGroup, onSelect, root]);

  return (
    <div className={styles.explorer} role="tree">
      <button
        className={styles.domainBtn}
        type="button"
        role="treeitem"
        aria-selected={selectedEntity === root}
        onClick={() => {
          onSelect(root);
        }}
      >
        <FiFileText className={styles.domainIcon} />
        {domain}
      </button>

      <EntityList
        level={0}
        entities={root.children}
        selectedEntity={selectedEntity}
        expandedGroups={expandedGroups}
        onSelect={handleSelect}
      />
    </div>
  );
}

export default Explorer;
