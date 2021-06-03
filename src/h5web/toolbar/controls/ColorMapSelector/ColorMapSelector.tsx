import { INTERPOLATORS } from '../../../vis-packs/core/heatmap/interpolators';
import type { ColorMap } from '../../../vis-packs/core/heatmap/models';
import { getLinearGradient } from '../../../vis-packs/core/heatmap/utils';
import Selector from '../Selector/Selector';
import styles from './ColorMapSelector.module.css';
import ToggleBtn from '../ToggleBtn';
import { FiShuffle } from 'react-icons/fi';
import { COLORMAP_GROUPS } from './groups';

function ColorMapOption(props: { option: ColorMap }) {
  const { option } = props;
  const backgroundImage = getLinearGradient(INTERPOLATORS[option], 'right');

  return (
    <>
      {option}
      <div
        className={styles.gradient}
        style={{ backgroundImage }}
        data-keep-colors
      />
    </>
  );
}

interface Props {
  value: ColorMap;
  onValueChange: (colorMap: ColorMap) => void;
  invert: boolean;
  onInversionChange: () => void;
}

function ColorMapSelector(props: Props) {
  const { value, onValueChange, invert, onInversionChange } = props;

  return (
    <div className={styles.selectorWrapper}>
      <Selector
        value={value}
        onChange={onValueChange}
        options={COLORMAP_GROUPS}
        optionComponent={ColorMapOption}
      />
      <ToggleBtn
        small
        label="Invert"
        icon={FiShuffle}
        value={invert}
        onToggle={onInversionChange}
      />
    </div>
  );
}

export default ColorMapSelector;
