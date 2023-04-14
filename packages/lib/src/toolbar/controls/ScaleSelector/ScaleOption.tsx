import { type ScaleType } from '@h5web/shared';

import { H5WEB_SCALES } from '../../../vis/scales';
import styles from './ScaleSelector.module.css';

function ScaleOption(props: { option: ScaleType }) {
  const { option } = props;
  const { Icon, label } = H5WEB_SCALES[option];

  return (
    <div className={styles.option}>
      <Icon className={styles.icon} />
      <span>{label}</span>
    </div>
  );
}

export default ScaleOption;
