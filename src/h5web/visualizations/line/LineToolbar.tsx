import React, { CSSProperties } from 'react';
import shallow from 'zustand/shallow';
import Select from 'react-select';
import Toggler from '../shared/Toggler';
import { useLineConfig } from './config';
import { customThemeForSelect } from '../shared/utils';
import { Glyph } from './models';
import styles from './LineToolbar.module.css';

type OptionType = {
  label: string;
  value: Glyph;
};

const glyphOptions = [
  { label: 'Line', value: Glyph.Line },
  { label: 'Points', value: Glyph.Square },
];

function LineToolbar(): JSX.Element {
  const [
    glyph,
    setGlyph,
    showGrid,
    toggleGrid,
    hasYLogScale,
    toggleYLogScale,
  ] = useLineConfig(
    state => [
      state.glyph,
      state.setGlyph,
      state.showGrid,
      state.toggleGrid,
      state.hasYLogScale,
      state.toggleYLogScale,
    ],
    shallow
  );

  return (
    <>
      <Select
        className={styles.glyphSelector}
        defaultValue={glyphOptions.find(o => o.value === glyph)}
        options={glyphOptions}
        onChange={selection => {
          if (selection) {
            setGlyph((selection as OptionType).value);
          }
        }}
        styles={{
          control: (provided: CSSProperties) => ({
            ...provided,
            backgroundColor: 'transparent',
            borderWidth: '0 1px',
          }),
        }}
        theme={customThemeForSelect}
      />
      <Toggler label="Show grid" value={showGrid} onChange={toggleGrid} />
      <Toggler
        label="Y SymLog scale"
        value={hasYLogScale}
        onChange={toggleYLogScale}
      />
    </>
  );
}

export default LineToolbar;
