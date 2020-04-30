import React, { CSSProperties } from 'react';
import Select, {
  components,
  OptionProps,
  IndicatorProps,
  SingleValueProps,
} from 'react-select';
import { FiChevronDown } from 'react-icons/fi';
import shallow from 'zustand/shallow';
import { generateCSSLinearGradient } from './utils';
import { INTERPOLATORS } from './interpolators';
import { useHeatmapConfig } from './config';
import styles from './HeatmapToolbar.module.css';
import { ColorMap } from './models';

type OptionType = {
  label: ColorMap;
  value: ColorMap;
};

const DropdownIndicator = (props: IndicatorProps<OptionType>): JSX.Element => {
  return (
    <components.DropdownIndicator {...props}>
      <FiChevronDown />
    </components.DropdownIndicator>
  );
};

const ColorMapLabel = (props: { data: OptionType }): JSX.Element => {
  const {
    data: { label, value },
  } = props;
  return (
    <>
      {label}
      <div
        style={{
          backgroundImage: generateCSSLinearGradient(
            INTERPOLATORS[value],
            'right'
          ),
          width: '2rem',
          marginLeft: '0.5rem',
        }}
      />
    </>
  );
};

const Option = (props: OptionProps<OptionType>): JSX.Element => {
  const { data } = props;

  return (
    <components.Option {...props}>
      <ColorMapLabel data={data} />
    </components.Option>
  );
};

const SingleValue = (props: SingleValueProps<OptionType>): JSX.Element => {
  const { data } = props;

  return (
    <components.SingleValue {...props}>
      <ColorMapLabel data={data} />
    </components.SingleValue>
  );
};

// react-select expects to work with objects of type {label: string, value: string}
// So I use the color map name as both label and value
const colorMapOptions = Object.keys(INTERPOLATORS).map(
  colormap =>
    ({
      label: colormap,
      value: colormap,
    } as OptionType)
);

function ColorMapSelector(): JSX.Element {
  const [colorMap, setColorMap] = useHeatmapConfig(state => [
    state.colorMap,
    state.setColorMap,
    shallow,
  ]);

  const customStyles = {
    option: (provided: CSSProperties) => ({
      ...provided,
      display: 'flex',
      justifyContent: 'space-between',
    }),
    singleValue: (provided: CSSProperties) => ({
      ...provided,
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
    }),
    control: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: 'transparent',
      borderWidth: '0 1px',
    }),
    indicatorSeparator: () => ({}),
  };

  return (
    <div className={styles.selectorWrapper}>
      <Select
        className={styles.colorMapSelector}
        defaultValue={{ label: colorMap, value: colorMap }}
        options={colorMapOptions}
        onChange={selection => {
          setColorMap((selection as OptionType).value);
        }}
        components={{ DropdownIndicator, Option, SingleValue }}
        styles={customStyles}
        theme={theme => ({
          ...theme,
          borderRadius: 0,
          colors: {
            ...theme.colors,
            primary: 'var(--secondary-dark)',
            primary75: 'var(--secondary)',
            primary50: 'var(--secondary-light)',
            primary25: 'var(--secondary-light-bg)',
          },
        })}
      />
    </div>
  );
}

export default ColorMapSelector;
