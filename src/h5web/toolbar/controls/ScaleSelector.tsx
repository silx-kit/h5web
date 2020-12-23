import type { ReactElement } from 'react';
import type { IconType } from 'react-icons/lib';
import { MdSort, MdFilterList, MdGraphicEq } from 'react-icons/md';
import { ScaleType } from '../../visualizations/shared/models';
import Selector from './Selector/Selector';
import styles from './ScaleSelector.module.css';

const ICONS: Record<ScaleType, IconType> = {
  [ScaleType.Linear]: MdSort,
  [ScaleType.Log]: MdFilterList,
  [ScaleType.SymLog]: (iconProps) => (
    <MdGraphicEq transform="rotate(90)" {...iconProps} />
  ),
};

const LABELS: Record<ScaleType, string> = {
  [ScaleType.Linear]: 'Linear',
  [ScaleType.Log]: 'Log',
  [ScaleType.SymLog]: 'SymLog',
};

interface Props {
  value: ScaleType;
  label?: string;
  disabled?: boolean;
  onScaleChange: (scale: ScaleType) => void;
}

function ScaleOption(props: { option: ScaleType }): ReactElement {
  const { option } = props;
  const Icon = ICONS[option];
  return (
    <>
      <Icon className={styles.icon} />
      {LABELS[option]}
    </>
  );
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
