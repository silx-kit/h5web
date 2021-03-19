import { forwardRef, HTMLProps } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import type { IconType } from 'react-icons/lib';
import styles from './Thumb.module.css';

type Props = HTMLProps<HTMLDivElement> & {
  isAuto: boolean;
  hasError: boolean;
  AutoIcon: IconType;
};

const Thumb = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { isAuto, hasError, AutoIcon, ...thumbProps } = props;

  return (
    <div
      ref={ref}
      {...thumbProps}
      className={styles.thumb}
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
