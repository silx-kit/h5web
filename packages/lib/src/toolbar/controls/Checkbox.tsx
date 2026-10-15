import { isDefined } from '@h5web/shared/guards';
import { useEffect, useId, useRef } from 'react';

import { type ClassStyleAttrs } from '../../vis/models';
import styles from './Checkbox.module.css';

interface Props extends ClassStyleAttrs {
  label: string;
  disabled?: boolean;
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
}

function Checkbox(props: Props) {
  const {
    className,
    style,
    label,
    disabled,
    checked,
    indeterminate,
    onChange,
  } = props;
  const labelId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Re-apply on `checked` change, since toggling the input resets its `indeterminate` state
    if (inputRef.current && isDefined(indeterminate)) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [checked, indeterminate]);

  return (
    <label
      id={labelId}
      className={`${styles.label} ${className}`}
      style={style}
      htmlFor={inputId}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={() => onChange?.(!checked)}
        aria-labelledby={labelId}
      />
      <span className={styles.text}>{label}</span>
    </label>
  );
}

export default Checkbox;
