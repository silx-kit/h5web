import type { ReactElement } from 'react';
import { useTimeout } from 'react-use';
import styles from './ValueLoader.module.css';

interface Props {
  message?: string;
}

function ValueLoader(props: Props): ReactElement {
  const { message = 'Loading' } = props;

  // Wait a bit before showing loader to avoid flash
  const [isReady] = useTimeout(100);

  if (!isReady()) {
    return <></>;
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
      <p>{message}...</p>
    </div>
  );
}

export default ValueLoader;
