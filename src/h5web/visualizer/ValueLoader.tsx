import { useContext } from 'react';
import { useTimeout } from 'react-use';
import { ProviderContext } from '../providers/context';
import styles from './ValueLoader.module.css';

interface Props {
  message?: string;
}

function ValueLoader(props: Props) {
  const { message = 'Loading data' } = props;
  const { valuesStore } = useContext(ProviderContext);

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
