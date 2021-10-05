import { FiShuffle } from 'react-icons/fi';

import type { ColorMap } from '../../../vis-packs/core/heatmap/models';
import Selector from '../Selector/Selector';
import ToggleBtn from '../ToggleBtn';
import ColorMapOption from './ColorMapOption';
import styles from './ColorMapSelector.module.css';
import { COLORMAP_GROUPS } from './groups';

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
