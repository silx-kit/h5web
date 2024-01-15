import { useDebouncedCallback } from '@react-hookz/web';
import { useState } from 'react';
import { FiRotateCw } from 'react-icons/fi';

import Btn from './Btn';
import styles from './CellWidthInput.module.css';

const ID = 'h5w-cell-width';
const MIN = 50;

interface Props {
  value: number | undefined;
  defaultValue: number;
  onChange: (val: number | undefined) => void;
}

function CellWidthInput(props: Props) {
  const { value, defaultValue: rawDefaultValue, onChange } = props;

  const hasValue = value !== undefined;
  const defaultValue = Math.max(rawDefaultValue, MIN);

  const [inputValue, setInputValue] = useState(
    (value ?? defaultValue).toString(),
  );

  const onChangeDebounced = useDebouncedCallback(onChange, [onChange], 150);

  return (
    <div className={styles.root}>
      <label id={`${ID}-label`} className={styles.label} htmlFor={ID}>
        Cell width
      </label>

      <input
        id={ID}
        className={styles.input}
        type="number"
        value={inputValue}
        step={10}
        min={MIN}
        placeholder={defaultValue.toString()}
        aria-labelledby={`${ID}-label`} // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/566
        data-modified={hasValue || undefined}
        onInput={(evt) => {
          const { value: newValue } = evt.currentTarget;
          setInputValue(newValue);

          if (!newValue) {
            onChange(undefined);
            return;
          }

          const numValue = Number.parseInt(newValue);
          const safeNumValue =
            Number.isNaN(numValue) ? defaultValue : Math.max(numValue, MIN);

          onChangeDebounced(safeNumValue);
        }}
        onBlur={() => setInputValue((value ?? defaultValue).toString())}
      />

      <Btn
        label="Reset"
        icon={FiRotateCw}
        iconOnly
        small
        disabled={!hasValue}
        onClick={() => {
          setInputValue(defaultValue.toString());
          onChange(undefined);
        }}
      />
    </div>
  );
}

export default CellWidthInput;
