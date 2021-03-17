import { FiCornerDownRight } from 'react-icons/fi';
import { MdSwapVert } from 'react-icons/md';
import styles from './DomainTooltip.module.css';

interface Props {
  isAuto: boolean;
  onSwap: () => void;
}

function MinGreaterErrorMessage(props: Props) {
  const { isAuto, onSwap } = props;

  return (
    <p className={styles.minMaxError}>
      <span>
        Min greater than max
        <br />
        <FiCornerDownRight /> falling back to <strong>data range</strong>
      </span>
      {!isAuto && (
        <button
          className={styles.actionBtn}
          type="button"
          onClick={() => onSwap()}
        >
          <MdSwapVert>Swap</MdSwapVert>
        </button>
      )}
    </p>
  );
}

export default MinGreaterErrorMessage;
