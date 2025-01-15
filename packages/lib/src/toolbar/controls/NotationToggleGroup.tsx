import { Notation } from '../../vis/matrix/models';
import styles from './NotationToggleGroup.module.css';
import ToggleGroup from './ToggleGroup/ToggleGroup';

interface Props {
  value: Notation;
  onChange: (val: Notation) => void;
}

const ID = 'h5w-matrix-notation';

function NotationToggleGroup(props: Props) {
  const { value, onChange } = props;

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={ID}>
        Notation
      </label>
      <ToggleGroup
        id={ID}
        role="radiogroup"
        value={value}
        onChange={(val) => onChange(val as Notation)}
      >
        <ToggleGroup.Btn label="Auto" value={Notation.Auto} />
        <ToggleGroup.Btn label="Scientific" value={Notation.Scientific} />
        <ToggleGroup.Btn label="Fixed-point" value={Notation.FixedPoint} />
      </ToggleGroup>
    </div>
  );
}

export default NotationToggleGroup;
