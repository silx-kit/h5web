import { FiShuffle } from 'react-icons/fi';

import { type ColorMap } from '../../../vis/heatmap/models';
import Selector from '../Selector/Selector';
import ToggleBtn from '../ToggleBtn';
import ColorMapGradient from './ColorMapGradient';
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
    <>
      <Selector
        value={value}
        onChange={onValueChange}
        options={COLORMAP_GROUPS}
        renderOption={(option) => (
          <div className={styles.option}>
            {option}
            <ColorMapGradient colorMap={option} />
          </div>
        )}
      />

      <ToggleBtn
        small
        label="Invert"
        Icon={FiShuffle}
        value={invert}
        onToggle={onInversionChange}
      />
    </>
  );
}

export default ColorMapSelector;
