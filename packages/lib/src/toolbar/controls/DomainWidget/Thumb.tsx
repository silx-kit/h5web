import { Thumb as SliderThumb } from '@radix-ui/react-slider';
import { useSize } from '@radix-ui/react-use-size';
import { type HTMLAttributes, useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { type IconType } from 'react-icons/lib';

import { type Bound } from '../../../vis/models';
import styles from './Thumb.module.css';

interface Props extends HTMLAttributes<HTMLDivElement> {
  bound: Bound;
  ratio: number; // position of thumb along slider, between 0 and 1
  isAuto: boolean;
  hasError: boolean;
  disabled: boolean;
  AutoIcon: IconType;
}

function Thumb(props: Props) {
  const { bound, ratio, isAuto, hasError, disabled, AutoIcon, ...thumbProps } =
    props;

  // Once Radix has measured the thumb, it offsets it to keep it within the bounds of the slider;
  // measure it the same way to cancel this offset, so the thumb ends up centred on its value
  const [thumb, setThumb] = useState<HTMLDivElement | null>(null);
  const size = useSize(thumb);

  return (
    <SliderThumb asChild>
      <div
        ref={setThumb}
        {...thumbProps}
        className={styles.thumb}
        style={size?.width ? { translate: `${(ratio - 0.5) * 100}%` } : {}}
        aria-label={`Change ${bound} limit`}
        aria-disabled={disabled || undefined}
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
    </SliderThumb>
  );
}

export default Thumb;
