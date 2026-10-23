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
    indeterminate = false,
    onChange,
  } = props;
  const labelId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  /* Keep the `indeterminate` DOM property of the checkbox in sync with
   * the `indeterminate` prop. Consumers should remember to reset the
   * `indeterminate` prop to `false` when `checked` changes, as this is
   * the expected behaviour of a checkbox.
   * https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/ */
  useEffect(() => {
    if (inputRef.current) {
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
