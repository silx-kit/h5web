import { useTimeoutEffect, useToggle } from '@react-hookz/web';
import { useEffect, useState } from 'react';

import { useDataContext } from '../providers/DataProvider';
import { CANCELLED_ERROR_MSG } from '../providers/utils';
import styles from './ValueLoader.module.css';

const MAX_PROGRESS_BARS = 3;

interface Props {
  isSlice?: boolean;
}

function ValueLoader(props: Props) {
  const { isSlice = false } = props;
  const { valuesStore, addProgressListener, removeProgressListener } =
    useDataContext();

  const [progress, setProgress] = useState<number[]>();

  useEffect(() => {
    addProgressListener(setProgress);
    return () => removeProgressListener(setProgress);
  }, [addProgressListener, removeProgressListener, setProgress]);

  // Wait a bit before showing loader to avoid flash
  const [isReady, toggleReady] = useToggle();
  useTimeoutEffect(toggleReady, 100);

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
          {progress && (
            <div className={styles.progressBars}>
              {progress.slice(0, MAX_PROGRESS_BARS).map((val, index) => (
                <progress className={styles.progress} key={index} value={val} /> // eslint-disable-line react/no-array-index-key
              ))}
            </div>
          )}
          <p>{isSlice ? 'Loading current slice' : 'Loading data'}...</p>
          <p>
            <button
              className={styles.cancelBtn}
              type="button"
              onClick={() => valuesStore.abortAll(CANCELLED_ERROR_MSG)}
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
