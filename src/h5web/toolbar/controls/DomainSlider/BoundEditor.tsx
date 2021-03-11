import { ReactElement, useEffect, useRef, useState } from 'react';
import { FiCheck, FiSlash } from 'react-icons/fi';
import { formatPreciseValue } from '../../../utils';
import styles from './BoundEditor.module.css';

interface Props {
  label: string;
  value: number;
  isEditing: boolean;
  hasError: boolean;
  onEditToggle: (force: boolean) => void;
  onChange: (val: number) => void;
}

function BoundEditor(props: Props): ReactElement {
  const { label, value, isEditing, hasError, onEditToggle, onChange } = props;

  const id = `${label}-bound`;
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

    if (isEditing && label === 'Min') {
      // Give focus to min field when opening tooltip in edit mode
      inputRef.current?.focus();
    }
  }, [isEditing, label]);

  return (
    <form
      className={styles.boundEditor}
      data-error={hasError || undefined}
      data-editing={isEditing}
      onSubmit={(evt) => {
        evt.preventDefault();
        onChange(Number.parseFloat(inputValue));
        onEditToggle(false);
      }}
    >
      <label id={`${id}-label`} className={styles.label} htmlFor={id}>
        {label}
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

      <button className={styles.action} type="submit" disabled={!isEditing}>
        <FiCheck>Apply</FiCheck>
      </button>
      <button
        className={styles.action}
        type="button"
        disabled={!isEditing}
        onClick={() => onEditToggle(false)}
      >
        <FiSlash>Cancel</FiSlash>
      </button>
    </form>
  );
}

export default BoundEditor;
