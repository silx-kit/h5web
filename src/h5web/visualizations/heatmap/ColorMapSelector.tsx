import React, { CSSProperties } from 'react';
import Select, {
  components,
  OptionProps,
  IndicatorProps,
  SingleValueProps,
} from 'react-select';
import { FiChevronDown } from 'react-icons/fi';
import shallow from 'zustand/shallow';
import { generateCSSLinearGradient, convertToOptions } from './utils';
import {
  INTERPOLATORS,
  MOST_USED,
  SINGLE_HUE,
  MULTI_HUE,
  CYCLICAL,
  DIVERGING,
} from './interpolators';
import { useHeatmapConfig } from './config';
import styles from './HeatmapToolbar.module.css';
import { ColorMapOption } from './models';
import { customThemeForSelect } from '../shared/utils';

const colorMapOptions = [
  {
    label: 'Common',
    options: convertToOptions(MOST_USED),
  },
  {
    label: 'Single hue',
    options: convertToOptions(SINGLE_HUE),
  },
  {
    label: 'Multi hue',
    options: convertToOptions(MULTI_HUE),
  },
  {
    label: 'Cyclical',
    options: convertToOptions(CYCLICAL),
  },
  {
    label: 'Diverging',
    options: convertToOptions(DIVERGING),
  },
];

function ColorMapLabel(props: ColorMapOption): JSX.Element {
  const { label, value } = props;

  const interpolator = INTERPOLATORS[value];
  const backgroundImage = generateCSSLinearGradient(interpolator, 'right');

  return (
    <>
      {label}
      <div
        style={{
          backgroundImage,
          width: '2rem',
          marginLeft: '0.5rem',
        }}
      />
    </>
  );
}

function Option(props: OptionProps<ColorMapOption>): JSX.Element {
  const { data } = props;
  return (
    <components.Option {...props}>
      <ColorMapLabel {...data} />
    </components.Option>
  );
}

function SingleValue(props: SingleValueProps<ColorMapOption>): JSX.Element {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <ColorMapLabel {...data} />
    </components.SingleValue>
  );
}

function DropdownIndicator(props: IndicatorProps<ColorMapOption>): JSX.Element {
  return (
    <components.DropdownIndicator {...props}>
      <FiChevronDown />
    </components.DropdownIndicator>
  );
}

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
          setColorMap((selection as ColorMapOption).value);
        }}
        components={{ Option, SingleValue, DropdownIndicator }}
        styles={customStyles}
        theme={customThemeForSelect}
      />
    </div>
  );
}

export default ColorMapSelector;
