import { useTimeoutEffect, useToggle } from '@react-hookz/web';

import styles from './App.module.css';

interface Props {
  isInspecting: boolean;
  message?: string;
}

function EntityLoader(props: Props) {
  const { isInspecting, message = 'Loading' } = props;

  // Wait a bit before showing loader to avoid flash
  const [isReady, toggleReady] = useToggle();
  useTimeoutEffect(toggleReady, 100);

  return (
    <>
      <div
        className={styles.fallbackBar}
        data-mode={isInspecting ? 'inspect' : 'display'}
        data-testid="LoadingEntity" // bypass delay in tests
      />
      {isReady && <p className={styles.fallback}>{message}...</p>}
    </>
  );
}

export default EntityLoader;
