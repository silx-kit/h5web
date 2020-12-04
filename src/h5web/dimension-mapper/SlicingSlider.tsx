import React, { ReactElement } from 'react';
import ReactSlider from 'react-slider';
import { useMeasure } from 'react-use';
import styles from './SlicingSlider.module.css';
import type { DimensionMapping } from './models';

const MIN_HEIGHT_PER_MARK = 25;

interface Props {
  dimension: number;
  slicingIndex: number;
  rawDims: number[];
  mapperState: DimensionMapping;
  onChange: (mapperState: DimensionMapping) => void;
}

function SlicingSlider(props: Props): ReactElement {
  const { dimension, slicingIndex, rawDims, mapperState, onChange } = props;
  const [containerRef, { height }] = useMeasure();

  return (
    <div key={dimension} ref={containerRef} className={styles.container}>
      <span className={styles.label}>D{dimension}</span>
      <ReactSlider
        // Force refresh when slider height changes - i.e. when Y-axis mapper appears/disappears
        // https://github.com/zillow/react-slider/issues/172
        key={`${mapperState.includes('y')}`}
        className={styles.slider}
        trackClassName={styles.track}
        thumbClassName={styles.thumb}
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
        marks={height / rawDims[dimension] >= MIN_HEIGHT_PER_MARK}
        markClassName={styles.mark}
        step={1}
        orientation="vertical"
        invert
      />
    </div>
  );
}

export default SlicingSlider;
