import { useId } from 'react';

import styles from './Checkbox.module.css';

interface Props {
  label: string;
  disabled?: boolean;
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

function Checkbox(props: Props) {
  const { label, disabled, checked, onChange } = props;
  const labelId = useId();
  const inputId = useId();

  return (
    <label
      id={labelId}
      className={styles.label}
      htmlFor={inputId}
      aria-disabled={disabled}
    >
      <input
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
