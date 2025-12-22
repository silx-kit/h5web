import { isGroup } from '@h5web/shared/guards';
import { type ChildEntity } from '@h5web/shared/hdf5-models';
import { useToggle } from '@react-hookz/web';
import {
  type CSSProperties,
  type KeyboardEvent,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
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

  // Group AND (selected OR parent of selected entity)
  const shouldBeExpanded =
    isGroup(entity) &&
    (selectedPath === path || selectedPath.startsWith(`${path}/`));

  const [isExpanded, toggleExpanded] = useToggle(shouldBeExpanded);

  // Expand group if needed — e.g. when navigating via NX attributes
  useLayoutEffect(() => {
    if (shouldBeExpanded) {
      toggleExpanded(true);
    }
  }, [shouldBeExpanded, toggleExpanded]);

  // Restore focus on selected entity when swtiching between sidebar tabs
  useEffect(() => {
    if (isSelected) {
      btnRef.current?.focus();
    }
  }, [btnRef, isSelected]);

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent<HTMLButtonElement>) => {
      switch (evt.key) {
        case 'Home':
          focusFirst(evt);
          return;

        case 'End':
          focusLast(evt);
          return;

        case 'ArrowDown':
          focusNext(evt);
          return;

        case 'ArrowUp':
          focusPrevious(evt);
          return;

        case 'ArrowLeft':
          if (isGroup(entity) && isExpanded) {
            toggleExpanded(false);
            evt.preventDefault();
          } else {
            focusParent(evt);
          }
          return;

        case 'ArrowRight':
          if (!isGroup(entity)) {
            return;
          }
          if (isExpanded) {
            focusNext(evt, true);
          } else {
            toggleExpanded(true);
            evt.preventDefault();
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

        <ErrorBoundary fallback={null}>
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
