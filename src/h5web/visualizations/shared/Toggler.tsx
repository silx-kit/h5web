import React from 'react';
import { IconType } from 'react-icons';
import styles from './Toggler.module.css';

interface Props {
  label: string;
  icon?: IconType;
  value: boolean;
  onChange: () => void;
}

function Toggler(props: Props): JSX.Element {
  const { label, icon: Icon, value, onChange } = props;

  return (
    <button
      className={styles.toggler}
      type="button"
      role="switch"
      aria-checked={value}
      onClick={onChange}
    >
      <span className={styles.box}>
        {Icon && <Icon className={styles.icon} />}
        <span className={styles.label}>{label}</span>
      </span>
    </button>
  );
}

export default Toggler;
