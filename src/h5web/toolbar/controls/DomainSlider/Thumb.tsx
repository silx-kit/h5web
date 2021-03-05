import { forwardRef, HTMLProps } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import type { IconType } from 'react-icons/lib';
import styles from './DomainSlider.module.css';

type Props = HTMLProps<HTMLDivElement> & {
  isAuto: boolean;
  hasError: boolean;
  AutoIcon: IconType;
  disabled?: boolean;
};

const Thumb = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { isAuto, hasError, disabled, AutoIcon, ...thumbProps } = props;

  return (
    <div
      ref={ref}
      {...thumbProps}
      className={styles.thumb}
      tabIndex={disabled ? -1 : 0}
      data-auto={isAuto}
      data-error={hasError || undefined}
    >
      <div className={styles.thumbBtnLike}>
        {isAuto && <AutoIcon />}
        {hasError && <FiAlertCircle strokeWidth="3" />}
      </div>
    </div>
  );
});

export default Thumb;
