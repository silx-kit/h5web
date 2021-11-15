import { isGroup } from '@h5web/shared';
import type { Entity } from '@h5web/shared';
import { useToggle } from '@react-hookz/web';
import type { CSSProperties } from 'react';
import { Suspense, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

import EntityList from './EntityList';
import styles from './Explorer.module.css';
import Icon from './Icon';
import { isNxGroup } from './utils';

interface Props {
  path: string;
  entity: Entity;
  level: number;
  selectedPath: string;
  onSelect: (path: string) => void;
}

function EntityItem(props: Props) {
  const { path, entity, level, selectedPath, onSelect } = props;
  const isSelected = path === selectedPath;

  const [isExpanded, toggleExpanded] = useToggle(false);

  useEffect(() => {
    if (
      isGroup(entity) &&
      (selectedPath === path || selectedPath.startsWith(`${path}/`))
    ) {
      // If group is selected or is parent of selected entity, expand it
      toggleExpanded(true);
    }
  }, [entity, path, selectedPath, toggleExpanded]);

  return (
    <li
      className={styles.entity}
      style={{ '--level': level } as CSSProperties}
      role="none"
    >
      <button
        className={styles.btn}
        type="button"
        role="treeitem"
        aria-expanded={isGroup(entity) ? isExpanded : undefined}
        aria-selected={isSelected}
        onClick={() => {
          // Expand if collapsed; collapse is expanded and selected
          if (isGroup(entity) && (!isExpanded || isSelected)) {
            toggleExpanded();
          }

          onSelect(path);
        }}
      >
        <Icon entity={entity} isExpanded={isExpanded} />
        <span className={styles.name}>{entity.name}</span>
        {isNxGroup(entity) && (
          <span className={styles.nx} aria-label=" (NeXus group)">
            NX
          </span>
        )}
      </button>

      {isGroup(entity) && isExpanded && (
        <Suspense
          fallback={
            <FiRefreshCw
              className={styles.spinner}
              aria-label="Loading group metadata..."
            />
          }
        >
          <EntityList
            level={level + 1}
            parentPath={path}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        </Suspense>
      )}
    </li>
  );
}

export default EntityItem;
