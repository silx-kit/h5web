import { forwardRef, HTMLProps } from 'react';
import type { IconType } from 'react-icons/lib';
import styles from './DomainSlider.module.css';

type Props = HTMLProps<HTMLDivElement> & {
  isAuto: boolean;
  AutoIcon: IconType;
  disabled?: boolean;
};

const Thumb = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { isAuto, disabled, AutoIcon, ...thumbProps } = props;

  return (
    <div
      ref={ref}
      {...thumbProps}
      tabIndex={disabled ? -1 : 0}
      data-auto={isAuto}
    >
      <div className={styles.thumbBtnLike}>{isAuto && <AutoIcon />}</div>
    </div>
  );
});

export default Thumb;
