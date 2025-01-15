import { type ComplexType, type NumericType } from '@h5web/shared/hdf5-models';

import { type DatasetDef } from './models';
import styles from './NxSignalPicker.module.css';

interface Props<T extends NumericType | ComplexType> {
  definitions: DatasetDef<T>[];
  onChange: (def: DatasetDef<T>) => void;
}

function NxSignalPicker<T extends NumericType | ComplexType>(props: Props<T>) {
  const { definitions, onChange } = props;

  return (
    <p className={styles.bar}>
      <span className={styles.text}>Signal:</span>
      {definitions.map((def, index) => (
        <label key={def.dataset.name} className={styles.label}>
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
          <input
            type="radio"
            name="signal"
            value={def.dataset.name}
            defaultChecked={index === 0}
            autoComplete="off" // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#checked
            onChange={() => onChange(def)}
          />
          {def.dataset.name}
        </label>
      ))}
    </p>
  );
}

export default NxSignalPicker;
