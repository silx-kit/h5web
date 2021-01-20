import type { ReactElement } from 'react';
import type { IconType } from 'react-icons/lib';
import { MdSort, MdFilterList, MdGraphicEq } from 'react-icons/md';
import { ScaleType } from '../../visualizations/shared/models';
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

export default ScaleOption;
