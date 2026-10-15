import { Slider } from '@base-ui/react/slider';
import { FiAlertCircle } from 'react-icons/fi';
import { type IconType } from 'react-icons/lib';

import { type Bound } from '../../../vis/models';
import styles from './Thumb.module.css';

interface Props {
  index: number;
  bound: Bound;
  isAuto: boolean;
  hasError: boolean;
  AutoIcon: IconType;
}

function Thumb(props: Props) {
  const { index, bound, isAuto, hasError, AutoIcon } = props;

  return (
    <Slider.Thumb
      index={index}
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
    </Slider.Thumb>
  );
}

export default Thumb;
