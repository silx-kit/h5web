import { useContext, useEffect, useState } from 'react';
import { useTimeout } from 'react-use';

import { ProviderContext } from '../providers/context';
import styles from './ValueLoader.module.css';

const MAX_PROGRESS_BARS = 3;

interface Props {
  message?: string;
}

function ValueLoader(props: Props) {
  const { message = 'Loading data' } = props;
  const { valuesStore, addProgressListener, removeProgressListener } =
    useContext(ProviderContext);

  const [progress, setProgress] = useState<number[]>();

  useEffect(() => {
    addProgressListener(setProgress);
    return () => removeProgressListener(setProgress);
  }, [addProgressListener, removeProgressListener, setProgress]);

  // Wait a bit before showing loader to avoid flash
  const [isReady] = useTimeout(100);

  if (!isReady()) {
    return null;
  }

  return (
    <div className={styles.loader}>
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
      <p>{message}...</p>
      <p>
        <button
          className={styles.cancelBtn}
          type="button"
          onClick={() => valuesStore.cancelOngoing()}
        >
          Cancel?
        </button>
      </p>
    </div>
  );
}

export default ValueLoader;
