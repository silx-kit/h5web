import React from 'react';
import type { IconType } from 'react-icons';
import styles from './ToggleBtn.module.css';

interface Props {
  label: string;
  icon?: IconType;
  iconOnly?: boolean;
  value: boolean;
  onChange: () => void;
}

function ToggleBtn(props: Props): JSX.Element {
  const { label, icon: Icon, iconOnly, value, onChange } = props;

  return (
    <button
      className={styles.btn}
      type="button"
      aria-label={iconOnly ? label : undefined}
      aria-pressed={value}
      onClick={onChange}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!iconOnly && <span className={styles.label}>{label}</span>}
      </span>
    </button>
  );
}

export default ToggleBtn;
