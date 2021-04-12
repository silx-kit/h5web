import ReactSlider from 'react-slider';
import { useMeasure } from 'react-use';
import styles from './SlicingSlider.module.css';
import type { DimensionMapping } from './models';
import { Component, Fragment, useEffect, useRef } from 'react';

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
        min={0}
        max={rawDims[dimension] - 1}
        step={1}
        marks={height / rawDims[dimension] >= MIN_HEIGHT_PER_MARK}
        markClassName={styles.mark}
        orientation="vertical"
        invert
        value={slicingIndex}
        onChange={(value) => {
          const newMapperState = [...mapperState];
          newMapperState[dimension] = value as number;
          onChange(newMapperState);
        }}
        renderThumb={(thumbProps, state) => (
          <div {...thumbProps} className={styles.thumb}>
            {state.valueNow}
          </div>
        )}
        renderTrack={({ key }, { index }) =>
          index === 0 ? (
            <div key={key} className={styles.track} />
          ) : (
            <Fragment key={key} />
          )
        }
      />
    </div>
  );
}

export default SlicingSlider;
