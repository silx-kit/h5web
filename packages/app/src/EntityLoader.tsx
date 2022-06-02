import { useTimeout } from 'react-use';

import styles from './App.module.css';

const LOADER_DELAY = 100;

interface Props {
  isInspecting: boolean;
  message?: string;
}

function EntityLoader(props: Props) {
  const { isInspecting, message = 'Loading' } = props;

  // Wait a bit before showing loader to avoid flash
  const [isReady] = useTimeout(LOADER_DELAY);

  return (
    <>
      <div
        className={styles.fallbackBar}
        data-mode={isInspecting ? 'inspect' : 'display'}
        data-testid="LoadingEntity" // bypass `LOADER_DELAY` in tests
      />
      {isReady() && <p className={styles.fallback}>{message}...</p>}
    </>
  );
}

export default EntityLoader;
