import type { IconType } from 'react-icons/lib';
import { MdSort, MdFilterList } from 'react-icons/md';
import { ScaleType } from '../../../vis-packs/core/models';
import MdGraphicEqRotated from './MdGraphicEqRotated';
import styles from './ScaleSelector.module.css';

const ICONS: Record<ScaleType, IconType> = {
  [ScaleType.Linear]: MdSort,
  [ScaleType.Log]: MdFilterList,
  [ScaleType.SymLog]: MdGraphicEqRotated,
};

const LABELS: Record<ScaleType, string> = {
  [ScaleType.Linear]: 'Linear',
  [ScaleType.Log]: 'Log',
  [ScaleType.SymLog]: 'SymLog',
};

function ScaleOption(props: { option: ScaleType }) {
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
