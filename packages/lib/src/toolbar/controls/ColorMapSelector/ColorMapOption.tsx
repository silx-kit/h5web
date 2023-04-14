import { INTERPOLATORS } from '../../../vis/heatmap/interpolators';
import { type ColorMap } from '../../../vis/heatmap/models';
import { getLinearGradient } from '../../../vis/heatmap/utils';
import styles from './ColorMapSelector.module.css';

interface Props {
  option: ColorMap;
}

function ColorMapOption(props: Props) {
  const { option } = props;
  const backgroundImage = getLinearGradient(INTERPOLATORS[option], 'right');

  return (
    <div className={styles.option}>
      {option}
      <div
        className={styles.gradient}
        style={{ backgroundImage }}
        data-keep-colors
      />
    </div>
  );
}

export default ColorMapOption;
