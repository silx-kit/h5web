import type { ColorMap } from '../../../vis-packs/core/heatmap/models';
import Selector from '../Selector/Selector';
import styles from './ColorMapSelector.module.css';
import ToggleBtn from '../ToggleBtn';
import { FiShuffle } from 'react-icons/fi';
import { COLORMAP_GROUPS } from './groups';
import ColorMapOption from './ColorMapOption';

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
