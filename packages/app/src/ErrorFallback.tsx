import { AbortError } from '@h5web/shared/react-suspense-fetch';
import { type FallbackProps } from 'react-error-boundary';

import styles from './App.module.css';

interface Props extends FallbackProps {
  className?: string;
  error: unknown;
}

function ErrorFallback(props: Props) {
  const { className = '', error, resetErrorBoundary } = props;

  if (error instanceof AbortError) {
    return (
      <p className={`${styles.error} ${className}`}>
        Request cancelled
        <span>–</span>
        <button
          className={styles.retryBtn}
          type="button"
          onClick={() => resetErrorBoundary()}
        >
          Retry?
        </button>
      </p>
    );
  }

  if (
    error instanceof Error &&
    error.cause &&
    error.cause instanceof Error &&
    error.message !== error.cause.message
  ) {
    const { message } = error.cause;
    return (
      <details className={`${styles.detailedError} ${className}`}>
        <summary>{error.message}</summary>
        <pre>{message}</pre>
      </details>
    );
  }

  return (
    <p className={`${styles.error} ${className}`}>
      {error instanceof Error ? error.message : 'Unknown error'}
    </p>
  );
}

export default ErrorFallback;
