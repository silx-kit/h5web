import type { ScaleType } from '@h5web/shared';

import Selector from '../Selector/Selector';
import ScaleOption from './ScaleOption';

interface Props<T extends ScaleType> {
  label?: string;
  value: T;
  onScaleChange: (scale: T) => void;
  options: readonly T[];
}

function ScaleSelector<T extends ScaleType>(props: Props<T>) {
  const { label, value, onScaleChange, options } = props;

  return (
    <Selector
      label={label}
      value={value}
      onChange={onScaleChange}
      options={options as T[]} // remove `readonly`
      optionComponent={ScaleOption}
    />
  );
}

export default ScaleSelector;
