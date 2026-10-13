import { type HTMLProps, type Ref } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { type IconType } from 'react-icons/lib';

import { type Bound } from '../../../vis/models';
import styles from './Thumb.module.css';

interface Props extends HTMLProps<HTMLDivElement> {
  ref?: Ref<HTMLDivElement | null>;
  bound: Bound;
  isAuto: boolean;
  hasError: boolean;
  disabled: boolean;
  AutoIcon: IconType;
}

function Thumb(props: Props) {
  const { ref, bound, isAuto, hasError, disabled, AutoIcon, ...thumbProps } =
    props;

  return (
    <div
      ref={ref}
      {...thumbProps}
      className={styles.thumb}
      aria-label={`Change ${bound} limit`}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : thumbProps.tabIndex} // prevent tabbing when disabled
      data-auto={isAuto}
      data-error={hasError || undefined}
    >
      <div className={styles.thumbBtnLike}>
        {isAuto && <AutoIcon className={styles.icon} />}
        {!isAuto && hasError && (
          <FiAlertCircle className={styles.icon} strokeWidth="3" />
        )}
      </div>
    </div>
  );
}

export default Thumb;
