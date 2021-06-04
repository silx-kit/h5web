import { ScaleType } from '../../../vis-packs/core/models';
import Selector from '../Selector/Selector';
import ScaleOption from './ScaleOption';

interface Props {
  label?: string;
  value: ScaleType;
  onScaleChange: (scale: ScaleType) => void;
}

function ScaleSelector(props: Props) {
  const { label, value, onScaleChange } = props;

  return (
    <Selector
      label={label}
      value={value}
      onChange={onScaleChange}
      options={Object.values(ScaleType)}
      optionComponent={ScaleOption}
    />
  );
}

export default ScaleSelector;
