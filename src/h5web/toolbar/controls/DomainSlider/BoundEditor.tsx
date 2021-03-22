import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiSlash } from 'react-icons/fi';
import { formatPreciseValue } from '../../../utils';
import type { Bound } from '../../../vis-packs/core/models';
import { clampBound } from '../../../vis-packs/core/utils';
import styles from './BoundEditor.module.css';

interface Props {
  bound: Bound;
  value: number;
  isEditing: boolean;
  hasError: boolean;
  onEditToggle: (force: boolean) => void;
  onChange: (val: number) => void;
}

function BoundEditor(props: Props) {
  const { bound, value, isEditing, hasError, onEditToggle, onChange } = props;

  const id = `${bound}-bound`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setInputValue(formatPreciseValue(value));
  }, [value, setInputValue]);

  useEffect(() => {
    if (!isEditing) {
      // Remove focus from min field when editing is turned off
      inputRef.current?.blur();
    }

    if (isEditing && bound === 'min') {
      // Give focus to min field when opening tooltip in edit mode
      inputRef.current?.focus();
    }
  }, [isEditing, bound]);

  return (
    <form
      className={styles.boundEditor}
      data-error={hasError || undefined}
      data-editing={isEditing}
      onSubmit={(evt) => {
        evt.preventDefault();

        const parsedValue = Number.parseFloat(inputValue.replace('−', '-')); // U+2212 minus gives `NaN`
        const newValue = Number.isNaN(parsedValue)
          ? value
          : clampBound(parsedValue);

        // Clean up input in case value hasn't changed (since `useEffect` won't be triggered)
        setInputValue(formatPreciseValue(newValue));

        onChange(newValue);
        onEditToggle(false);
      }}
    >
      <label id={`${id}-label`} className={styles.label} htmlFor={id}>
        {bound}
      </label>

      <input
        id={id}
        ref={inputRef}
        className={styles.value}
        type="text"
        name="bound"
        value={inputValue}
        title={isEditing ? undefined : value.toString()}
        aria-labelledby={`${id}-label`} // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/566
        onChange={(evt) => setInputValue(evt.target.value)}
        onFocus={() => {
          if (!isEditing) {
            onEditToggle(true);
          }
        }}
      />

      <button
        className={styles.actionBtn}
        type="submit"
        disabled={!isEditing}
        aria-label={`Apply ${bound}`}
      >
        <FiCheck />
      </button>
      <button
        className={styles.actionBtn}
        type="button"
        disabled={!isEditing}
        aria-label={`Cancel ${bound}`}
        onClick={() => {
          onEditToggle(false);
          setInputValue(formatPreciseValue(value));
        }}
      >
        <FiSlash />
      </button>
    </form>
  );
}

export default BoundEditor;
