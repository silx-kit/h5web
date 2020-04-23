import React, { CSSProperties } from 'react';
import Select, { components } from 'react-select';
import { FiChevronDown } from 'react-icons/fi';
import shallow from 'zustand/shallow';
import { generateCSSLinearGradient } from './utils';
import { INTERPOLATORS } from './interpolators';
import { ColorMap, useHeatmapStore } from './store';
import styles from './HeatmapToolbar.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownIndicator = (props: any): JSX.Element => {
  return (
    <components.DropdownIndicator {...props}>
      <FiChevronDown />
    </components.DropdownIndicator>
  );
};

// react-select expects to work with objects of type {label: string, value: string}
// So I use the color map name as both label and value
const colorMapOptions = Object.keys(INTERPOLATORS).map(label => ({ label }));

function ColorMapSelector(): JSX.Element {
  const [colorMap, setColorMap] = useHeatmapStore(state => [
    state.colorMap,
    state.setColorMap,
    shallow,
  ]);

  const gradientStyles = {
    option: (
      selectStyles: CSSProperties,
      { data: { label } }: { data: { label: ColorMap } }
    ) => ({
      ...selectStyles,
      backgroundImage: generateCSSLinearGradient(INTERPOLATORS[label], 'right'),
      marginTop: '1px',
      marginBottom: '1px',
    }),
  };

  return (
    <Select
      className={styles.colorMapSelector}
      defaultValue={{ label: colorMap }}
      options={colorMapOptions}
      onChange={selection => {
        const colorOption = selection as { label: ColorMap };
        setColorMap(colorOption.label);
      }}
      styles={gradientStyles}
      components={{ DropdownIndicator }}
    />
  );
}

export default ColorMapSelector;
