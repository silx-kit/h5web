import { useEffect, useContext, ReactElement, useState } from 'react';
import { FiFileText } from 'react-icons/fi';
import type { Entity } from '../providers/models';
import EntityList from './EntityList';
import styles from './Explorer.module.css';
import { getEntityAtPath, getParents } from '../utils';
import { ProviderContext } from '../providers/context';
import { isGroup } from '../guards';
import { useSet } from 'react-use';

const DEFAULT_PATH = process.env.REACT_APP_DEFAULT_PATH || '/';

interface Props {
  onSelect: (path: string) => void;
}

function Explorer(props: Props): ReactElement {
  const { onSelect } = props;

  const { domain, groupsStore } = useContext(ProviderContext);
  const root = groupsStore.get('/');

  const [selectedPath, setSelectedPath] = useState<string>(DEFAULT_PATH);
  const [
    expandedGroups,
    { add: expandGroup, toggle: toggleGroup },
  ] = useSet<string>();

  function handleSelect(entity: Entity, path: string): void {
    const isExpanded = expandedGroups.has(entity.uid);
    const isSelected = path === selectedPath;
    setSelectedPath(path);

    // Expand if collapsed; collapse is expanded and selected
    if (isGroup(entity) && (!isExpanded || isSelected)) {
      toggleGroup(entity.uid);
    }

    onSelect(path);
  }

  useEffect(() => {
    // Find default path
    onSelect(DEFAULT_PATH);

    // // Expand entity if group
    // if (isGroup(entityToSelect)) {
    //   expandGroup(entityToSelect.uid);
    // }

    // // Expand parent groups
    // getParents(entityToSelect).forEach((group) => expandGroup(group.uid));
  }, [onSelect]);

  return (
    <div className={styles.explorer} role="tree">
      <button
        className={styles.domainBtn}
        type="button"
        role="treeitem"
        aria-selected={selectedPath === '/'}
        onClick={() => handleSelect(root, '/')}
      >
        <FiFileText className={styles.domainIcon} />
        {domain}
      </button>

      <EntityList
        level={0}
        parentPath="/"
        selectedPath={selectedPath}
        expandedGroups={expandedGroups}
        onSelect={handleSelect}
      />
    </div>
  );
}

export default Explorer;
