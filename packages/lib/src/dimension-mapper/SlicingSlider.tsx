import { useMeasure } from '@react-hookz/web';
import { useId, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

import Btn from '../toolbar/controls/Btn';
import Slider from '../toolbar/controls/Slider';
import { useDynamicDebouncedCallback } from './hooks';
import styles from './SlicingSlider.module.css';

const ID = 'h5w-slider';
const MIN_HEIGHT_PER_MARK = 25;
const SHORT_DELAY = 20;
const LONG_DELAY = 250;

interface Props {
  dimension: number;
  length: number;
  value: number;
  withControls: boolean;
  defaultStride?: number;
  isFastSlice?: (value: number) => boolean;
  onChange: (value: number) => void;
}

function SlicingSlider(props: Props) {
  const {
    dimension,
    length,
    value,
    withControls,
    defaultStride = 1,
    isFastSlice,
    onChange,
  } = props;

  if (length <= 0) {
    throw new Error('Expected non-empty dimension');
  }

  const [stride, setStride] = useState(defaultStride);
  const strideInputId = useId();

  const [localValue, setLocalValue] = useState(value);
  const onDebouncedChange = useDynamicDebouncedCallback(
    onChange,
    [onChange],
    (val) => (isFastSlice?.(val) ? SHORT_DELAY : LONG_DELAY),
  );

  // When the controlled value changes, adopt it during render
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  const [containerSize, containerRef] = useMeasure<HTMLDivElement>();
  const sliderLabelId = `${ID}-${dimension}-label`;

  return (
    <div key={dimension} ref={containerRef} className={styles.container}>
      <span id={sliderLabelId} className={styles.label}>
        D{dimension}
      </span>
      <span className={styles.sublabel}>0:{length - 1}</span>
      {length > 1 && (
        <>
          <Slider
            className={styles.slider}
            trackClassName={styles.track}
            min={0}
            max={length - 1}
            vertical
            value={[localValue]}
            onChange={([newValue]) => {
              setLocalValue(newValue);
              onDebouncedChange(newValue);
            }}
            renderThumb={(index, thumbProps) => (
              <div
                key={index}
                {...thumbProps}
                className={styles.thumb}
                aria-labelledby={sliderLabelId}
              >
                <span className={styles.thumbValue}>{localValue}</span>
              </div>
            )}
          >
            {containerSize &&
              containerSize.height / length >= MIN_HEIGHT_PER_MARK &&
              Array.from({ length }, (_, index) => (
                <span
                  key={index}
                  className={styles.mark}
                  style={{ bottom: `${(index / (length - 1)) * 100}%` }}
                />
              ))}
          </Slider>

          {withControls && (
            <div className={styles.slicingControls}>
              <Btn
                label="Next slice"
                Icon={FiChevronUp}
                iconOnly
                small
                onClick={() => {
                  const newValue = Math.min(localValue + stride, length - 1);
                  setLocalValue(newValue);
                  onDebouncedChange(newValue);
                }}
              />
              <Btn
                label="Previous slice"
                Icon={FiChevronDown}
                iconOnly
                small
                onClick={() => {
                  const newValue = Math.max(localValue - stride, 0);
                  setLocalValue(newValue);
                  onDebouncedChange(newValue);
                }}
              />
              <div className={styles.stride} title={`D${dimension} stride`}>
                <label
                  className={styles.strideLabel}
                  htmlFor={strideInputId}
                  aria-label="Stride"
                >
                  Δ
                </label>
                <input
                  id={strideInputId}
                  type="text"
                  className={styles.strideInput}
                  aria-label={`D${dimension} stride`}
                  defaultValue={stride}
                  onChange={(evt) => {
                    const newStride = Math.floor(Number(evt.target.value));
                    if (Number.isFinite(newStride) && newStride > 0) {
                      setStride(newStride);
                    }
                  }}
                  onFocus={(evt) => {
                    evt.target.select();
                  }}
                  onBlur={(evt) => {
                    const { target } = evt;
                    target.value = stride.toString(); // overwrite any invalid input on blur
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SlicingSlider;
