import { ReactElement, useEffect } from 'react';
import { FiCornerDownRight } from 'react-icons/fi';
import { useToggle } from 'react-use';
import { Bound, BoundError } from '../../../vis-packs/core/models';
import styles from './DomainTooltip.module.css';

interface Props {
  bound: Bound;
  error?: BoundError;
}

function BoundErrorMessage(props: Props): ReactElement {
  const { bound, error } = props;
  const [isSticky, toggleSticky] = useToggle(false);

  useEffect(() => {
    if (error) {
      toggleSticky(true);
    }
  }, [error, toggleSticky]);

  if (!error && isSticky) {
    // Maintain space occupied by error when it becomes `undefined`
    // (so the tooltip doesn't shrink and closes)
    return <p className={styles.error} />;
  }

  if (!error) {
    return <></>;
  }

  switch (error) {
    case BoundError.InvalidWithLog:
      return (
        <p className={styles.error}>
          Custom {bound} invalid with log scale
          <br />
          <FiCornerDownRight /> falling back to <strong>data {bound}</strong>
        </p>
      );
    case BoundError.CustomMaxFallback:
      return (
        <p className={styles.error}>
          Custom min invalid with log scale
          <br />
          <FiCornerDownRight /> falling back to <strong>custom max</strong>
        </p>
      );
    default:
      throw new Error('Unknown domain error');
  }
}

export default BoundErrorMessage;
