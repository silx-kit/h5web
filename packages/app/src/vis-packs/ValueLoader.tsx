import { useTimeoutEffect, useToggle } from '@react-hookz/web';
import { useStore } from 'zustand';

import { useDataContext } from '../providers/DataProvider';
import { CANCELLED_BY_USER } from '../providers/utils';
import styles from './ValueLoader.module.css';

const MAX_PROGRESS_BARS = 3;

interface Props {
  isSlice?: boolean;
}

function ValueLoader(props: Props) {
  const { isSlice = false } = props;
  const { valuesStore } = useDataContext();

  // Wait a bit before showing loader to avoid flash
  const [isReady, toggleReady] = useToggle();
  useTimeoutEffect(toggleReady, 100);

  // Track progress
  const { ongoing } = useStore(valuesStore.progressStore);

  return (
    <div className={styles.loader} data-testid="LoadingDatasetValue">
      {isReady && (
        <>
          <div className={styles.grid}>
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className={styles.progressBars}>
            {[...ongoing.entries()]
              .slice(0, MAX_PROGRESS_BARS)
              .map(([key, val]) => (
                <progress
                  className={styles.progress}
                  key={`${key.dataset.path}_${key.selection || ''}`}
                  value={val}
                />
              ))}
          </div>
          <p>{isSlice ? 'Loading current slice' : 'Loading data'}...</p>
          <p>
            <button
              className={styles.cancelBtn}
              type="button"
              onClick={() => valuesStore.abortAll(CANCELLED_BY_USER)}
            >
              Cancel?
            </button>
          </p>
        </>
      )}
    </div>
  );
}

export default ValueLoader;
