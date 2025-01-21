import { INTERPOLATORS } from '../../../vis/heatmap/interpolators';
import { type ColorMap } from '../../../vis/heatmap/models';
import { getLinearGradient } from '../../../vis/heatmap/utils';
import styles from './ColorMapSelector.module.css';

interface Props {
  colorMap: ColorMap;
}

function ColorMapGradient(props: Props) {
  const { colorMap } = props;

  return (
    <div
      className={styles.gradient}
      style={{
        backgroundImage: getLinearGradient(INTERPOLATORS[colorMap], 'right'),
      }}
      data-keep-colors
    />
  );
}

export default ColorMapGradient;
