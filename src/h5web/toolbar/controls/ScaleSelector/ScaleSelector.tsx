import { ScaleType } from '../../../vis-packs/core/models';
import Selector from '../Selector/Selector';
import ScaleOption from './ScaleOption';

interface Props {
  label?: string;
  value: ScaleType;
  onScaleChange: (scale: ScaleType) => void;
  options?: ScaleType[];
}

function ScaleSelector(props: Props) {
  const {
    label,
    value,
    onScaleChange,
    options = Object.values(ScaleType),
  } = props;

  return (
    <Selector
      label={label}
      value={value}
      onChange={onScaleChange}
      options={options}
      optionComponent={ScaleOption}
    />
  );
}

export default ScaleSelector;
