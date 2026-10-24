import styles from './HeightScaleSlider.module.css';

const MIN = 0.05;
const MAX = 2;

interface Props {
  value: number;
  onChange: (value: number) => void;
}

function HeightScaleSlider(props: Props) {
  const { value, onChange } = props;

  return (
    <label className={styles.root}>
      <span className={styles.label}>Height</span>
      <input
        className={styles.input}
        type="range"
        aria-label="Height scale"
        min={MIN}
        max={MAX}
        step={0.05}
        value={value}
        onChange={(evt) => onChange(evt.currentTarget.valueAsNumber)}
      />
      <span className={styles.value}>{`×${value.toFixed(2)}`}</span>
    </label>
  );
}

export default HeightScaleSlider;
