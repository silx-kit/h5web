import { Suspense, useEffect, useRef } from 'react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';

import { useDataContext } from '../providers/DataProvider';
import EntityList from './EntityList';
import styles from './Explorer.module.css';
import { EXPLORER_ID, focusLast, focusNext } from './utils';

interface Props {
  selectedPath: string;
  onSelect: (path: string) => void;
}

function Explorer(props: Props) {
  const { selectedPath, onSelect } = props;
  const { filename } = useDataContext();

  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const isRootSelected = selectedPath === '/';

  /* When swtiching between sidebar tabs (explore/search), we need to restore
   * focus on the selected tree item. This effect takes care of the root button;
   * another similar effect is located in the `EntityItem` component. */
  useEffect(() => {
    if (isRootSelected) {
      btnRef.current?.focus();
    }
  }, [btnRef, isRootSelected]);

  return (
    <div ref={ref} className={styles.explorer} role="tree" id={EXPLORER_ID}>
      <button
        ref={btnRef}
        className={styles.fileBtn}
        type="button"
        role="treeitem"
        aria-selected={isRootSelected}
        data-path="/"
        onClick={() => onSelect('/')}
        onKeyDown={(e) => {
          if (e.key === 'End') {
            focusLast(e);
            return;
          }

          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            focusNext(e);
          }
        }}
      >
        <FiFileText className={styles.fileIcon} />
        <span className={styles.name}>{filename}</span>
      </button>

      <Suspense
        fallback={
          <FiRefreshCw
            className={styles.spinner}
            aria-label="Loading root metadata..."
            data-testid="LoadingExplorerRoot"
          />
        }
      >
        <EntityList
          level={0}
          parentPath="/"
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      </Suspense>
    </div>
  );
}

export default Explorer;
