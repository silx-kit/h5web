import { isDefined } from '@h5web/shared/guards';
import { useId } from 'react';

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

  return (
    <label
      id={labelId}
      className={`${styles.label} ${className}`}
      style={style}
      htmlFor={inputId}
      aria-disabled={disabled}
    >
      <input
        ref={
          isDefined(indeterminate)
            ? (el) => el && (el.indeterminate = indeterminate) // eslint-disable-line no-param-reassign
            : undefined
        }
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
