import type { ReactElement } from 'react';
import {
  CYCLICAL,
  DIVERGING,
  INTERPOLATORS,
  RECOMMENDED,
  MULTI_HUE,
  SINGLE_HUE,
} from '../../vis-packs/core/heatmap/interpolators';
import type { ColorMap } from '../../vis-packs/core/heatmap/models';
import { getLinearGradient } from '../../vis-packs/core/heatmap/utils';
import Selector from './Selector/Selector';
import styles from './ColorMapSelector.module.css';
import ToggleBtn from './ToggleBtn';
import { FiShuffle } from 'react-icons/fi';

const COLORMAP_GROUPS = {
  Recommended: Object.keys(RECOMMENDED) as ColorMap[],
  'Single hue': Object.keys(SINGLE_HUE) as ColorMap[],
  'Multi hue': Object.keys(MULTI_HUE) as ColorMap[],
  Cyclical: Object.keys(CYCLICAL) as ColorMap[],
  Diverging: Object.keys(DIVERGING) as ColorMap[],
};

function ColorMapOption(props: { option: ColorMap }): ReactElement {
  const { option } = props;
  const backgroundImage = getLinearGradient(INTERPOLATORS[option], 'right');

  return (
    <>
      {option}
      <div className={styles.gradient} style={{ backgroundImage }} />
    </>
  );
}

interface Props {
  value: ColorMap;
  onValueChange: (colorMap: ColorMap) => void;
  invert: boolean;
  onInversionChange: () => void;
}

function ColorMapSelector(props: Props): ReactElement {
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
        onChange={onInversionChange}
      />
    </div>
  );
}

export default ColorMapSelector;
