import { isGroup } from '@h5web/shared/guards';
import type { ChildEntity } from '@h5web/shared/hdf5-models';
import { useToggle } from '@react-hookz/web';
import type { CSSProperties, KeyboardEvent } from 'react';
import { Suspense, useCallback, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FiRefreshCw } from 'react-icons/fi';

import EntityList from './EntityList';
import styles from './Explorer.module.css';
import Icon from './Icon';
import NxBadge from './NxBadge';
import {
  focusFirst,
  focusLast,
  focusNext,
  focusParent,
  focusPrevious,
} from './utils';

interface Props {
  path: string;
  entity: ChildEntity;
  level: number;
  selectedPath: string;
  onSelect: (path: string) => void;
}

function EntityItem(props: Props) {
  const { path, entity, level, selectedPath, onSelect } = props;
  const isSelected = path === selectedPath;

  const btnRef = useRef<HTMLButtonElement>(null);

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

  // When tabbing in, restore focus on the selected element
  useEffect(() => {
    if (isSelected) {
      btnRef.current?.focus();
    }
  }, [btnRef, isSelected]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case 'Home':
          focusFirst(e);
          return;

        case 'End':
          focusLast(e);
          return;

        case 'ArrowDown':
          focusNext(e);
          return;

        case 'ArrowUp':
          focusPrevious(e);
          return;

        case 'ArrowLeft':
          if (isGroup(entity) && isExpanded) {
            toggleExpanded(false);
            e.preventDefault();
          } else {
            focusParent(e);
          }
          return;

        case 'ArrowRight':
          if (!isGroup(entity)) {
            return;
          }
          if (isExpanded) {
            focusNext(e);
          } else {
            toggleExpanded(true);
            e.preventDefault();
          }
      }
    },
    [entity, isExpanded, toggleExpanded],
  );

  return (
    <li
      className={styles.entity}
      style={{ '--level': level } as CSSProperties}
      role="none"
    >
      <button
        ref={btnRef}
        className={styles.btn}
        type="button"
        role="treeitem"
        aria-expanded={isGroup(entity) ? isExpanded : undefined}
        aria-selected={isSelected}
        data-path={path}
        onClick={() => {
          // Expand if collapsed; collapse is expanded and selected
          if (isGroup(entity) && (!isExpanded || isSelected)) {
            toggleExpanded();
          }

          onSelect(path);
        }}
        onKeyDown={handleKeyDown}
      >
        <Icon entity={entity} isExpanded={isExpanded} />
        <span className={styles.name}>{entity.name}</span>

        <ErrorBoundary fallback={<> </>}>
          <Suspense fallback={<span data-testid="LoadingNxBadge" />}>
            <NxBadge entity={entity} />
          </Suspense>
        </ErrorBoundary>
      </button>

      {isGroup(entity) && isExpanded && (
        <Suspense
          fallback={
            <FiRefreshCw
              className={styles.spinner}
              aria-label="Loading group metadata..."
              data-testid="LoadingExplorerGroup"
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
