import { ScaleType } from '@h5web/shared/vis-models';
import { type IconType } from 'react-icons';
import { MdFilterList, MdFlare, MdSort } from 'react-icons/md';

import toolbarStyles from '../../Toolbar.module.css';
import Selector from '../Selector/Selector';
import MdGraphicEqRotated from './MdGraphicEqRotated';
import SqrtIcon from './SqrtIcon';

const SCALE_OPTIONS = {
  [ScaleType.Linear]: ['Linear', MdSort],
  [ScaleType.Log]: ['Log', MdFilterList],
  [ScaleType.SymLog]: ['SymLog', MdGraphicEqRotated],
  [ScaleType.Sqrt]: ['Square root', SqrtIcon],
  [ScaleType.Gamma]: ['Gamma', MdFlare],
} satisfies Record<ScaleType, [string, IconType]>;

interface Props<T extends ScaleType> {
  label?: string;
  value: T;
  onScaleChange: (scale: T) => void;
  options: T[];
}

function ScaleSelector<T extends ScaleType>(props: Props<T>) {
  const { label, value, onScaleChange, options } = props;

  return (
    <Selector
      label={label}
      value={value}
      onChange={onScaleChange}
      options={options}
      renderOption={(option) => {
        const [optLabel, OptIcon] = SCALE_OPTIONS[option];
        return (
          <>
            <OptIcon className={toolbarStyles.icon} />
            <span>{optLabel}</span>
          </>
        );
      }}
    />
  );
}

export default ScaleSelector;
