import React, { CSSProperties } from 'react';
import Select, { components } from 'react-select';
import { FiChevronUp } from 'react-icons/fi';
import { generateCSSLinearGradient } from './utils';
import { ColorMap, INTERPOLATORS } from './interpolators';
import { useHeatmapState, useHeatmapActions } from './store';

interface Props {
  className: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownIndicator = (props: any): JSX.Element => {
  return (
    <components.DropdownIndicator {...props}>
      <FiChevronUp />
    </components.DropdownIndicator>
  );
};

// react-select expects to work with objects of type {label: string, value: string}
// So I use the color map name as both label and value
const colorMapOptions = Object.keys(INTERPOLATORS).map(label => ({ label }));

function ColorMapSelector(props: Props): JSX.Element {
  const { className } = props;

  const { colorMap } = useHeatmapState();
  const { setColorMap } = useHeatmapActions();

  const gradientStyles = {
    option: (
      styles: CSSProperties,
      { data: { label } }: { data: { label: ColorMap } }
    ) => ({
      ...styles,
      backgroundImage: generateCSSLinearGradient(INTERPOLATORS[label], 'right'),
      marginTop: '1px',
      marginBottom: '1px',
    }),
  };

  return (
    <div className={className}>
      <Select
        defaultValue={{ label: colorMap }}
        options={colorMapOptions}
        onChange={selection => {
          const colorOption = selection as { label: ColorMap };
          setColorMap(colorOption.label);
        }}
        menuPlacement="top"
        styles={gradientStyles}
        components={{ DropdownIndicator }}
      />
    </div>
  );
}

export default ColorMapSelector;
