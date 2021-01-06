import type { ReactElement } from 'react';
import styles from './Visualizer.module.css';

interface Props {
  error: Error;
}

function ErrorMessage(props: Props): ReactElement {
  const { error } = props;
  return <p className={styles.error}>Error: {error.message}</p>;
}

export default ErrorMessage;
