import { CSSProperties, Suspense } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import styles from './Explorer.module.css';
import Icon from './Icon';
import { isGroup } from '../guards';
import type { Entity } from '../providers/models';
import EntityList from './EntityList';
import { useToggle } from 'react-use';

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

  const [isExpanded, toggleExpanded] = useToggle(
    isGroup(entity) && selectedPath.startsWith(path)
  );

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
        {entity.name}
      </button>

      {isGroup(entity) && isExpanded && (
        <Suspense
          fallback={
            <FiRefreshCw className={styles.spinner}>Loading...</FiRefreshCw>
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
