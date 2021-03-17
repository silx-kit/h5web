import { FiCornerDownRight } from 'react-icons/fi';
import { MdSwapVert } from 'react-icons/md';
import styles from './DomainTooltip.module.css';

interface Props {
  message: string;
  fallback: string;
  showSwapBtn?: boolean;
  onSwap?: () => void;
}

function ErrorMessage(props: Props) {
  const { message, fallback, showSwapBtn = false, onSwap } = props;

  return (
    <p className={styles.stickyError}>
      <span className={styles.errorMessage}>
        {message}
        <br />
        <FiCornerDownRight /> falling back to <strong>{fallback}</strong>
      </span>
      {showSwapBtn && onSwap && (
        <button
          className={styles.swapBtn}
          type="button"
          aria-label="Swap min and max"
          onClick={() => onSwap()}
        >
          <MdSwapVert />
        </button>
      )}
    </p>
  );
}

export default ErrorMessage;
