import { forwardRef, HTMLProps } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import type { IconType } from 'react-icons/lib';
import type { Bound } from '../../../vis-packs/core/models';
import styles from './Thumb.module.css';

interface Props extends HTMLProps<HTMLDivElement> {
  bound: Bound;
  isAuto: boolean;
  hasError: boolean;
  AutoIcon: IconType;
}

const Thumb = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { bound, isAuto, hasError, AutoIcon, ...thumbProps } = props;

  return (
    <div
      ref={ref}
      {...thumbProps}
      className={styles.thumb}
      aria-label={`Change ${bound} limit`}
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
});

export default Thumb;
