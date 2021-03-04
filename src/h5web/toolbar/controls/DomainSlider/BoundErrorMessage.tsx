import type { ReactElement } from 'react';
import { FiCornerDownRight } from 'react-icons/fi';
import { Bound, BoundError } from '../../../vis-packs/core/models';
import styles from './DomainSlider.module.css';

interface Props {
  bound: Bound;
  error: BoundError;
}

function BoundErrorMessage(props: Props): ReactElement {
  const { bound, error } = props;

  // eslint-disable-next-line sonarjs/no-small-switch
  switch (error) {
    case BoundError.InvalidWithLog:
      return (
        <p className={styles.error}>
          Custom {bound} invalid with log scale
          <br />
          <FiCornerDownRight /> falling back to <strong>data {bound}</strong>
        </p>
      );
    default:
      throw new Error('Unknown domain error');
  }
}

export default BoundErrorMessage;
