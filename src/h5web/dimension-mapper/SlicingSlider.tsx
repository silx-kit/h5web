import ReactSlider from 'react-slider';
import { useMeasure } from 'react-use';
import styles from './SlicingSlider.module.css';
import type { DimensionMapping } from './models';
import { Component, useEffect, useRef } from 'react';

const MIN_HEIGHT_PER_MARK = 25;

interface Props {
  dimension: number;
  slicingIndex: number;
  rawDims: number[];
  mapperState: DimensionMapping;
  onChange: (mapperState: DimensionMapping) => void;
}

function SlicingSlider(props: Props) {
  const { dimension, slicingIndex, rawDims, mapperState, onChange } = props;

  const [containerRef, { height }] = useMeasure();
  const sliderRef = useRef<Component<ReactSlider.ReactSliderProps>>(null);

  useEffect(() => {
    // @ts-ignore
    sliderRef.current?.resize();
  }, [height]);

  return (
    <div
      key={dimension}
      ref={containerRef as (element: HTMLElement | null) => void} // https://github.com/streamich/react-use/issues/1264
      className={styles.container}
    >
      <span className={styles.label}>D{dimension}</span>
      <ReactSlider
        ref={sliderRef}
        className={styles.slider}
        ariaLabel="Dimension slider"
        trackClassName={styles.track}
        thumbClassName={styles.thumb}
        renderThumb={(thumbProps, state) => (
          <div {...thumbProps}>{state.valueNow}</div>
        )}
        value={slicingIndex}
        onChange={(value) => {
          const newMapperState = [...mapperState];
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
