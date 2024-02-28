import { useMeasure, useThrottledCallback } from '@react-hookz/web';
import { useState } from 'react';
import ReactSlider from 'react-slider';

import styles from './SlicingSlider.module.css';

const ID = 'h5w-slider';
const MIN_HEIGHT_PER_MARK = 25;
const SLICING_THROTTLE_DELAY = 100;

interface Props {
  dimension: number;
  maxIndex: number;
  initialValue: number;
  onChange: (value: number) => void;
}

function SlicingSlider(props: Props) {
  const { dimension, maxIndex, initialValue, onChange } = props;

  const [value, setValue] = useState(initialValue);
  const onThrottledChange = useThrottledCallback(
    onChange,
    [onChange],
    SLICING_THROTTLE_DELAY,
  );

  const [containerSize, containerRef] = useMeasure<HTMLDivElement>();
  const sliderLabelId = `${ID}-${dimension}-label`;

  return (
    <div key={dimension} ref={containerRef} className={styles.container}>
      <span id={sliderLabelId} className={styles.label}>
        D{dimension}
      </span>
      <span className={styles.sublabel}>0:{maxIndex}</span>
      {maxIndex > 0 ? (
        <ReactSlider
          className={styles.slider}
          ariaLabelledby={sliderLabelId}
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
          onChange={(newValue) => {
            setValue(newValue);
            onThrottledChange(newValue);
          }}
          /* When slicing in E2E tests, `onChange` is called with the old value.
             The `onChange` event is fired via a `setState` callback in `ReactSlider`:
             https://github.com/zillow/react-slider/blob/master/src/components/ReactSlider/ReactSlider.jsx#L908
             Adding `onAfterChange` fixes the issue for now with react-slider@2.0.4, but not with react-slider@2.0.5+ */
          onAfterChange={(newValue) => {
            setValue(newValue);
            onThrottledChange(newValue);
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
