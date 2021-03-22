import { useTimeout } from 'react-use';
import styles from './App.module.css';

interface Props {
  isInspecting: boolean;
  message?: string;
}

function LoadingFallback(props: Props) {
  const { isInspecting, message = 'Loading' } = props;

  // Wait a bit before showing loader to avoid flash
  const [isReady] = useTimeout(100);

  return (
    <>
      <div
        className={styles.fallbackBar}
        data-mode={isInspecting ? 'inspect' : 'display'}
      />
      {isReady() && <p className={styles.fallback}>{message}...</p>}
    </>
  );
}

export default LoadingFallback;
