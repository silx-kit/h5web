import type { FallbackProps } from 'react-error-boundary';

import styles from './App.module.css';
import { CANCELLED_ERROR_MSG } from './providers/utils';

function ErrorFallback(props: FallbackProps) {
  const { error, resetErrorBoundary } = props;

  if (error.cause || error.cause instanceof Error) {
    const { message } = error.cause;
    return (
      <details className={styles.detailedError}>
        <summary>{error.message}</summary>
        <pre>{message}</pre>
      </details>
    );
  }

  return (
    <p className={styles.error}>
      {error.message}
      {error.message === CANCELLED_ERROR_MSG && (
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
