import React, { CSSProperties } from 'react';
import Select, { components } from 'react-select';
import { FiChevronUp } from 'react-icons/fi';
import { generateCSSLinearGradient } from './utils';
import { ColorMap, INTERPOLATORS } from './interpolators';

interface Props {
  className: string;
  currentColorMap: ColorMap;
  changeColorMap: React.Dispatch<React.SetStateAction<ColorMap>>;
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
const colorMapOptions = Object.keys(INTERPOLATORS).map(label => {
  return { label };
});

function ColorMapSelector(props: Props): JSX.Element {
  const { className, currentColorMap, changeColorMap } = props;

  const gradientStyles = {
    option: (
      styles: CSSProperties,
      { data }: { data: { label: ColorMap } }
    ) => {
      return {
        ...styles,
        backgroundImage: generateCSSLinearGradient(
          INTERPOLATORS[data.label],
          'right'
        ),
        marginTop: '1px',
        marginBottom: '1px',
      };
    },
  };
  return (
    <div className={className}>
      <Select
        defaultValue={{ label: currentColorMap }}
        options={colorMapOptions}
        onChange={selection => {
          const colorOption = selection as { label: ColorMap };
          changeColorMap(colorOption.label);
        }}
        menuPlacement="top"
        styles={gradientStyles}
        components={{ DropdownIndicator }}
      />
    </div>
  );
}

export default ColorMapSelector;
