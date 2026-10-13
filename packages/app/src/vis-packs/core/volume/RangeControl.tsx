import styles from './RangeControl.module.css';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function RangeControl(props: Props) {
  const { label, value, onChange } = props;

  return (
    <label className={styles.control}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        aria-label={label}
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(evt) => onChange(evt.target.valueAsNumber)}
      />
    </label>
  );
}

export default RangeControl;
