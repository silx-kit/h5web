import React, { CSSProperties, ReactElement } from 'react';
import styles from './Explorer.module.css';
import type { Entity } from '../providers/models';
import Icon from './Icon';
import { isGroup } from '../guards';

interface Props {
  level: number;
  entities: Entity[];
  selectedEntity?: Entity;
  expandedGroups: Set<string>;
  onSelect: (entity: Entity) => void;
}

function EntityList(props: Props): ReactElement {
  const { level, entities, selectedEntity, expandedGroups, onSelect } = props;

  if (entities.length === 0) {
    return <></>;
  }

  return (
    <ul className={styles.group} role="group">
      {entities.map((entity) => {
        const { uid, name } = entity;
        const isExpanded = expandedGroups.has(entity.uid);

        return (
          <li
            key={uid}
            style={{ '--level': level } as CSSProperties}
            role="none"
          >
            <button
              className={styles.btn}
              type="button"
              role="treeitem"
              aria-expanded={isGroup(entity) ? isExpanded : undefined}
              aria-selected={entity === selectedEntity}
              onClick={() => {
                onSelect(entity);
              }}
            >
              <Icon entity={entity} isExpanded={isExpanded} />
              {name}
            </button>

            {isGroup(entity) && isExpanded && (
              <EntityList
                level={level + 1}
                entities={entity.children}
                selectedEntity={selectedEntity}
                expandedGroups={expandedGroups}
                onSelect={onSelect}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default EntityList;
