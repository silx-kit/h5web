import { ComplexVisType } from '@h5web/shared/vis-models';

import Selector from './Selector/Selector';

const VIS_TYPE_OPTIONS = {
  [ComplexVisType.Amplitude]: '𝓐 Amplitude',
  [ComplexVisType.Phase]: 'φ Phase',
  [ComplexVisType.PhaseUnwrapped]: 'φ Phase (unwrapped)',
  [ComplexVisType.PhaseAmplitude]: 'φ𝓐 Phase & Amp.',
} satisfies Record<ComplexVisType, string>;

interface Props<T extends ComplexVisType> {
  label?: string;
  value: T;
  onChange: (scale: T) => void;
  options: T[];
}

function ComplexVisTypeSelector<T extends ComplexVisType>(props: Props<T>) {
  const { label, value, onChange, options } = props;

  return (
    <Selector
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      renderOption={(option) => VIS_TYPE_OPTIONS[option]}
    />
  );
}

export default ComplexVisTypeSelector;
