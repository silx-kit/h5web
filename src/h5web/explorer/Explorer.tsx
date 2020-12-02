import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  ReactElement,
} from 'react';
import { FiFileText } from 'react-icons/fi';
import type { MyHDF5Entity } from '../providers/models';
import TreeView, { ExpandedGroups } from './TreeView';
import styles from './Explorer.module.css';
import { buildTree, getEntityAtPath } from './utils';
import { ProviderContext } from '../providers/context';
import { isMyGroup } from '../providers/utils';

const DEFAULT_PATH: number[] = JSON.parse(
  process.env.REACT_APP_DEFAULT_PATH || '[]'
);

interface Props {
  onSelect: (entity: MyHDF5Entity) => void;
  selectedEntity?: MyHDF5Entity;
}

function Explorer(props: Props): ReactElement {
  const { onSelect, selectedEntity } = props;

  const { domain, metadata } = useContext(ProviderContext);
  const root = useMemo(() => buildTree(metadata, domain), [domain, metadata]);

  const [expandedGroups, setExpandedGroups] = useState<ExpandedGroups>({});

  function handleSelect(entity: MyHDF5Entity): void {
    const isExpanded = !!expandedGroups[entity.uid];
    const isSelected = entity === selectedEntity;
    onSelect(entity);

    if (isMyGroup(entity) && (!isExpanded || isSelected)) {
      setExpandedGroups({
        ...expandedGroups,
        [entity.uid]: !isExpanded,
      });
    }
  }

  useEffect(() => {
    const entityToSelect = getEntityAtPath(root, DEFAULT_PATH);
    onSelect(entityToSelect);

    // Expand groups on default path and selected entity if group
    setExpandedGroups(
      entityToSelect.parents.reduce(
        (acc, group) => ({ ...acc, [group.uid]: true }),
        isMyGroup(entityToSelect) ? { [entityToSelect.uid]: true } : {}
      )
    );
  }, [onSelect, root]);

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

      <TreeView
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
