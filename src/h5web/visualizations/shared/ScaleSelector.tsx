import React, { ReactElement } from 'react';
import { MdSort, MdFilterList, MdGraphicEq } from 'react-icons/md';
import ToggleGroup from './ToggleGroup';
import { ScaleType } from './models';

interface Props {
  value: ScaleType;
  onScaleChange: (scale: ScaleType) => void;
}

function ScaleSelector(props: Props): ReactElement {
  const { value, onScaleChange } = props;
  return (
    <ToggleGroup
      role="radiogroup"
      ariaLabel="Scale type"
      value={value}
      onChange={onScaleChange}
    >
      <ToggleGroup.Btn icon={MdSort} label="Linear" value={ScaleType.Linear} />
      <ToggleGroup.Btn icon={MdFilterList} label="Log" value={ScaleType.Log} />
      <ToggleGroup.Btn
        icon={(iconProps) => (
          <MdGraphicEq {...iconProps} transform="rotate(90)" />
        )}
        label="SymLog"
        value={ScaleType.SymLog}
      />
    </ToggleGroup>
  );
}

export default ScaleSelector;
