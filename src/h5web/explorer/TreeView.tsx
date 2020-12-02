import React, { CSSProperties, ReactElement } from 'react';
import styles from './Explorer.module.css';
import { MyHDF5Entity } from '../providers/models';
import Icon from './Icon';
import { isMyGroup } from '../providers/utils';

export type ExpandedGroups = Record<string, boolean>;

interface Props {
  level: number;
  entities: MyHDF5Entity[];
  selectedEntity?: MyHDF5Entity;
  expandedGroups: ExpandedGroups;
  onSelect: (entity: MyHDF5Entity) => void;
}

function TreeView(props: Props): ReactElement {
  const { level, entities, selectedEntity, expandedGroups, onSelect } = props;

  if (entities.length === 0) {
    return <></>;
  }

  return (
    <ul className={styles.group} role="group">
      {entities.map((entity) => {
        const { uid, name } = entity;
        const isExpanded = !!expandedGroups[entity.uid];

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
              aria-expanded={isMyGroup(entity) ? isExpanded : undefined} // Leaves cannot be expanded
              aria-selected={entity === selectedEntity}
              onClick={() => {
                onSelect(entity);
              }}
            >
              <Icon entity={entity} isExpanded={isExpanded} />
              {name}
            </button>

            {isMyGroup(entity) && isExpanded && (
              <TreeView
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

export default TreeView;
