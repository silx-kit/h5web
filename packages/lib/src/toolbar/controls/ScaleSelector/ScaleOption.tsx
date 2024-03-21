import { ScaleType } from '@h5web/shared/vis-models';
import type { IconType } from 'react-icons/lib';
import { MdFilterList, MdFlare, MdSort } from 'react-icons/md';

import toolbarStyles from '../../Toolbar.module.css';
import MdGraphicEqRotated from './MdGraphicEqRotated';
import styles from './ScaleOption.module.css';
import SqrtIcon from './SqrtIcon';

export const SCALE_OPTIONS = {
  [ScaleType.Linear]: { Icon: MdSort, label: 'Linear' },
  [ScaleType.Log]: { Icon: MdFilterList, label: 'Log' },
  [ScaleType.SymLog]: { Icon: MdGraphicEqRotated, label: 'SymLog' },
  [ScaleType.Sqrt]: { Icon: SqrtIcon, label: 'Square root' },
  [ScaleType.Gamma]: { Icon: MdFlare, label: 'Gamma' },
} satisfies Record<ScaleType, { Icon: IconType; label: string }>;

function ScaleOption(props: { option: ScaleType }) {
  const { option } = props;
  const { Icon, label } = SCALE_OPTIONS[option];

  return (
    <div className={styles.option}>
      <Icon className={toolbarStyles.icon} />
      <span>{label}</span>
    </div>
  );
}

export default ScaleOption;
