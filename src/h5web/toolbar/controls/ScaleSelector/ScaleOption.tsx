import type { ScaleType } from '../../../vis-packs/core/models';
import styles from '../../Toolbar.module.css';
import { H5WEB_SCALES } from '../../../vis-packs/core/scales';

function ScaleOption(props: { option: ScaleType }) {
  const { option } = props;
  const { Icon, label } = H5WEB_SCALES[option];
  return (
    <>
      <Icon className={styles.icon} />
      {label}
    </>
  );
}

export default ScaleOption;
