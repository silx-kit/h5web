import { useDebouncedCallback, useMeasure } from '@react-hookz/web';
import { useEffect, useRef, useState } from 'react';
import ReactSlider from 'react-slider';

import styles from './SlicingSlider.module.css';

const MIN_HEIGHT_PER_MARK = 25;

interface Props {
  dimension: number;
  maxIndex: number;
  initialValue: number;
  onChange: (value: number) => void;
}

function SlicingSlider(props: Props) {
  const { dimension, maxIndex, initialValue, onChange } = props;

  const [value, setValue] = useState(initialValue);

  const [containerSize, containerRef] = useMeasure<HTMLDivElement>();
  const sliderRef = useRef<ReactSlider>(null);

  const onDebouncedChange = useDebouncedCallback(onChange, [onChange], 250);

  useEffect(() => {
    sliderRef.current?.resize();
  }, [containerSize]);

  return (
    <div key={dimension} ref={containerRef} className={styles.container}>
      <span className={styles.label}>D{dimension}</span>
      <span className={styles.sublabel}>0:{maxIndex}</span>
      {maxIndex > 0 ? (
        <ReactSlider
          ref={sliderRef}
          className={styles.slider}
          ariaLabel="Dimension slider"
          min={0}
          max={maxIndex}
          step={1}
          marks={
            containerSize &&
            containerSize.height / (maxIndex + 1) >= MIN_HEIGHT_PER_MARK
          }
          markClassName={styles.mark}
          orientation="vertical"
          invert
          value={value}
          onChange={(value) => {
            setValue(value);
            onDebouncedChange(value);
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
      ) : null}
    </div>
  );
}

export default SlicingSlider;
