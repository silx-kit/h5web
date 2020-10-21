import React, { ReactElement } from 'react';
import ReactSlider from 'react-slider';
import styles from './DimensionMapper.module.css';
import type { DimensionMapping } from './models';

interface Props {
  dimension: number;
  slicingIndex: number;
  rawDims: number[];
  mapperState: NonNullable<DimensionMapping>;
  onChange: (mapperState: DimensionMapping) => void;
}

function SlicingSlider(props: Props): ReactElement {
  const { dimension, slicingIndex, rawDims, mapperState, onChange } = props;

  return (
    <div key={dimension} className={styles.sliderWrapper}>
      <span className={styles.sliderLabel}>D{dimension}</span>
      <ReactSlider
        // Force refresh when slider height changes - i.e. when Y-axis mapper appears/disappears
        // https://github.com/zillow/react-slider/issues/172
        key={`${mapperState.includes('y')}`}
        className={styles.slider}
        trackClassName={styles.sliderTrack}
        thumbClassName={styles.sliderThumb}
        renderThumb={(thumbProps, state) => (
          <div {...thumbProps}>{state.valueNow}</div>
        )}
        value={slicingIndex}
        onChange={(value) => {
          const newMapperState = mapperState.slice();
          newMapperState[dimension] = value as number;
          onChange(newMapperState);
        }}
        min={0}
        max={rawDims[dimension] - 1}
        step={1}
        orientation="vertical"
        invert
      />
    </div>
  );
}

export default SlicingSlider;
