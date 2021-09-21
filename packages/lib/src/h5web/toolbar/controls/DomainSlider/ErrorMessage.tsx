import { FiCornerDownRight } from 'react-icons/fi';
import { MdSwapVert } from 'react-icons/md';
import { DomainError } from '../../../vis-packs/core/models';
import styles from './DomainTooltip.module.css';

const ERRORS = {
  [DomainError.MinGreater]: {
    message: 'Min greater than max',
    fallback: 'data range',
  },
  [DomainError.InvalidMinWithScale]: {
    message: 'Custom min invalid with this scale',
    fallback: 'data min',
  },
  [DomainError.InvalidMaxWithScale]: {
    message: 'Custom max invalid with this scale',
    fallback: 'data max',
  },
  [DomainError.CustomMaxFallback]: {
    message: 'Custom min invalid with this scale',
    fallback: 'custom max',
  },
};

interface Props {
  error: DomainError;
  showSwapBtn?: boolean;
  onSwap?: () => void;
}

function ErrorMessage(props: Props) {
  const { error, showSwapBtn = false, onSwap } = props;
  const { message, fallback } = ERRORS[error];

  return (
    <p className={styles.error}>
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
