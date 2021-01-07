import {
  CSSProperties,
  ReactElement,
  Suspense,
  useContext,
  useEffect,
} from 'react';
import styles from './Explorer.module.css';
import type { Entity } from '../providers/models';
import Icon from './Icon';
import { isGroup } from '../guards';
import { ProviderContext } from '../providers/context';
import { FiRefreshCw } from 'react-icons/fi';

interface Props {
  level: number;
  parentPath: string;
  selectedPath: string;
  expandedGroups: Set<string>;
  onSelect: (entity: Entity, path: string) => void;
}

function EntityList(props: Props): ReactElement {
  const { level, parentPath, selectedPath, expandedGroups, onSelect } = props;

  const { groupsStore } = useContext(ProviderContext);
  const entities = groupsStore.get(parentPath).children;

  if (entities.length === 0) {
    return <></>;
  }

  return (
    <ul className={styles.group} role="group">
      {entities.map((entity) => {
        const { uid, name } = entity;
        const path = `${parentPath === '/' ? '' : parentPath}/${name}`;
        const isExpanded = expandedGroups.has(entity.uid);

        return (
          <li
            key={uid}
            className={styles.entity}
            style={{ '--level': level } as CSSProperties}
            role="none"
          >
            <button
              className={styles.btn}
              type="button"
              role="treeitem"
              aria-expanded={isGroup(entity) ? isExpanded : undefined}
              aria-selected={path === selectedPath}
              onClick={() => onSelect(entity, path)}
            >
              <Icon entity={entity} isExpanded={isExpanded} />
              {name}
            </button>

            {isGroup(entity) && isExpanded && (
              <Suspense
                fallback={
                  <FiRefreshCw className={styles.spinner}>
                    Loading...
                  </FiRefreshCw>
                }
              >
                <EntityList
                  level={level + 1}
                  parentPath={path}
                  selectedPath={selectedPath}
                  expandedGroups={expandedGroups}
                  onSelect={onSelect}
                />
              </Suspense>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default EntityList;
