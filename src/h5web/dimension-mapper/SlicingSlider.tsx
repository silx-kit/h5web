import ReactSlider from 'react-slider';
import { useMeasure } from '@react-hookz/web';
import styles from './SlicingSlider.module.css';
import type { DimensionMapping } from './models';
import { useEffect, useRef } from 'react';

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

  const [containerSize, containerRef] = useMeasure<HTMLDivElement>();
  const sliderRef = useRef<ReactSlider>(null);

  useEffect(() => {
    sliderRef.current?.resize();
  }, [containerSize]);

  return (
    <div key={dimension} ref={containerRef} className={styles.container}>
      <span className={styles.label}>D{dimension}</span>
      <ReactSlider
        ref={sliderRef}
        className={styles.slider}
        ariaLabel="Dimension slider"
        min={0}
        max={rawDims[dimension] - 1}
        step={1}
        marks={
          containerSize &&
          containerSize.height / rawDims[dimension] >= MIN_HEIGHT_PER_MARK
        }
        markClassName={styles.mark}
        orientation="vertical"
        invert
        value={slicingIndex}
        onChange={(value) => {
          const newMapperState = [...mapperState];
          newMapperState[dimension] = value;
          onChange(newMapperState);
        }}
        renderThumb={(thumbProps, state) => (
          <div {...thumbProps} className={styles.thumb}>
            {state.valueNow}
          </div>
        )}
        renderTrack={({ key }, { index }) =>
          index === 0 ? <div key={key} className={styles.track} /> : null
        }
      />
    </div>
  );
}

export default SlicingSlider;
