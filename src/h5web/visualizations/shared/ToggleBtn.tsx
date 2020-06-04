import React from 'react';
import type { IconType } from 'react-icons';
import styles from './ToggleBtn.module.css';

interface Props {
  label: string;
  icon?: IconType;
  hideLabel?: boolean;
  value: boolean;
  onChange: () => void;
}

function ToggleBtn(props: Props): JSX.Element {
  const { label, icon: Icon, hideLabel, value, onChange } = props;

  return (
    <button
      className={styles.btn}
      type="button"
      aria-label={hideLabel ? label : undefined}
      aria-pressed={value}
      onClick={onChange}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!hideLabel && <span className={styles.label}>{label}</span>}
      </span>
    </button>
  );
}

export default ToggleBtn;
