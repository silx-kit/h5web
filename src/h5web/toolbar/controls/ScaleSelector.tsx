import type { ReactElement } from 'react';
import { ScaleType } from '../../visualizations/shared/models';
import Selector from './Selector/Selector';
import styles from './ScaleSelector.module.css';
import ScaleOption from './ScaleOption';

interface Props {
  value: ScaleType;
  label?: string;
  disabled?: boolean;
  onScaleChange: (scale: ScaleType) => void;
}

function ScaleSelector(props: Props): ReactElement {
  const { value, label, disabled, onScaleChange } = props;

  return (
    <div className={styles.root}>
      {label && <span className={styles.label}>{label}</span>}
      <Selector
        value={value}
        onChange={onScaleChange}
        disabled={disabled}
        options={Object.values(ScaleType)}
        optionComponent={ScaleOption}
      />
    </div>
  );
}

export default ScaleSelector;
