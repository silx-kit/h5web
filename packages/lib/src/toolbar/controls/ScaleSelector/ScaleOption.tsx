import { ScaleType } from '@h5web/shared/vis-models';
import type { IconType } from 'react-icons/lib';
import { MdFilterList, MdFlare, MdSort } from 'react-icons/md';

import toolbarStyles from '../../Toolbar.module.css';
import MdGraphicEqRotated from './MdGraphicEqRotated';
import SqrtIcon from './SqrtIcon';

export const SCALE_OPTIONS = {
  [ScaleType.Linear]: { Icon: MdSort, label: 'Linear' },
  [ScaleType.Log]: { Icon: MdFilterList, label: 'Log' },
  [ScaleType.SymLog]: { Icon: MdGraphicEqRotated, label: 'SymLog' },
  [ScaleType.Sqrt]: { Icon: SqrtIcon, label: 'Square root' },
  [ScaleType.Gamma]: { Icon: MdFlare, label: 'Gamma' },
} satisfies Record<ScaleType, { Icon: IconType; label: string }>;

interface Props {
  option: ScaleType;
}

function ScaleOption(props: Props) {
  const { option } = props;
  const { Icon, label } = SCALE_OPTIONS[option];

  return (
    <>
      <Icon className={toolbarStyles.icon} />
      <span>{label}</span>
    </>
  );
}

export default ScaleOption;
