import type { ReactElement } from 'react';
import { useTimeout } from 'react-use';
import styles from './Loader.module.css';

interface Props {
  message?: string;
}

function Loader(props: Props): ReactElement {
  const { message = 'Loading' } = props;

  // Wait a bit before showing loader to avoid flash
  const [isReady] = useTimeout(50);

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

export default Loader;
