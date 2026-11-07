import { type Domain } from '@h5web/shared/vis-models';
import { type Ref } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { type IconType } from 'react-icons/lib';

import { type Bound } from '../../../vis/models';
import styles from './Thumb.module.css';

const KEY_STEPS: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
  PageDown: -10,
  PageUp: 10,
  Home: -Infinity,
  End: Infinity,
};

interface Props {
  ref?: Ref<HTMLDivElement | null>;
  bound: Bound;
  value: number;
  range: Domain;
  isAuto: boolean;
  hasError: boolean;
  disabled: boolean;
  AutoIcon: IconType;
  onChange: (value: number) => void;
  onEnd: () => void;
}

function Thumb(props: Props) {
  const {
    ref,
    bound,
    value,
    range,
    isAuto,
    hasError,
    disabled,
    AutoIcon,
    onChange,
    onEnd,
  } = props;
  const [min, max] = range;

  return (
    <div
      ref={ref}
      className={styles.thumb}
      style={{ left: `${((value - min) / (max - min)) * 100}%` }}
      role="slider"
      tabIndex={disabled ? -1 : 0} // prevent tabbing when disabled
      aria-label={`Change ${bound} limit`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-disabled={disabled || undefined}
      data-auto={isAuto}
      data-error={hasError || undefined}
      onKeyDown={(evt) => {
        const step = KEY_STEPS[evt.key];
        if (step !== undefined) {
          evt.preventDefault();
          onChange(Math.min(Math.max(value + step, min), max));
        }
      }}
      onKeyUp={onEnd}
      onBlur={onEnd}
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
