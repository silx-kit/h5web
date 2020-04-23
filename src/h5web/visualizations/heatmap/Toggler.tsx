import React from 'react';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import styles from './HeatmapToolbar.module.css';

interface Props {
  label: string;
  value: boolean;
  onChange: () => void;
}

function Toggler(props: Props): JSX.Element {
  const { label, value, onChange } = props;
  return (
    <button
      className={styles.toggler}
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => {
        onChange();
      }}
    >
      {value ? <FiToggleRight /> : <FiToggleLeft />}
      {label}
    </button>
  );
}

export default Toggler;
