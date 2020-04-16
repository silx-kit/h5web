import React from 'react';
import { FiEyeOff, FiEye } from 'react-icons/fi';
import styles from './HeatmapVis.module.css';

interface Props {
  value: boolean;
  onChange: (val: boolean) => void;
}

function LogScaleToggler(props: Props): JSX.Element {
  const { value, onChange } = props;

  return (
    <button
      onClick={() => {
        onChange(!value);
      }}
      type="button"
      role="switch"
      aria-checked={value}
      className={styles.scaleTypeSelector}
    >
      {value ? <FiEye /> : <FiEyeOff />}
      SymLog scale
    </button>
  );
}

export default LogScaleToggler;
