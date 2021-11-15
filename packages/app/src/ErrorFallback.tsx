import type { FallbackProps } from 'react-error-boundary';

import styles from './App.module.css';
import { ProviderError } from './providers/models';

function ErrorFallback(props: FallbackProps) {
  const { error, resetErrorBoundary } = props;

  return (
    <p className={styles.error}>
      {error.message}
      {error.message === ProviderError.Cancelled && (
        <>
          <span>–</span>
          <button
            className={styles.retryBtn}
            type="button"
            onClick={() => resetErrorBoundary()}
          >
            Retry?
          </button>
        </>
      )}
    </p>
  );
}

export default ErrorFallback;
