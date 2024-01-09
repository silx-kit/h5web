import type { ScaleType } from '@h5web/shared/vis-models';

import Selector from '../Selector/Selector';
import ScaleOption from './ScaleOption';

interface Props<T extends ScaleType> {
  label?: string;
  value: T;
  onScaleChange: (scale: T) => void;
  options: T[];
}

function ScaleSelector<T extends ScaleType>(props: Props<T>) {
  const { label, value, onScaleChange, options } = props;

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
