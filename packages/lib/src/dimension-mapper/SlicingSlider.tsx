import { Slider } from '@base-ui/react/slider';
import { useMeasure } from '@react-hookz/web';
import { useId, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

import Btn from '../toolbar/controls/Btn';
import { useDynamicDebouncedCallback } from './hooks';
import styles from './SlicingSlider.module.css';

const ID = 'h5w-slider';
const MIN_HEIGHT_PER_MARK = 25;
const SHORT_DELAY = 20;
const LONG_DELAY = 250;

interface Props {
  dimension: number;
  length: number;
  initialValue: number;
  withControls: boolean;
  isFastSlice?: (value: number) => boolean;
  onChange: (value: number) => void;
}

function SlicingSlider(props: Props) {
  const {
    dimension,
    length,
    initialValue,
    withControls,
    isFastSlice,
    onChange,
  } = props;

  if (length <= 0) {
    throw new Error('Expected non-empty dimension');
  }

  const [stride, setStride] = useState(1);
  const strideInputId = useId();

  const [value, setValue] = useState(initialValue);
  const onDebouncedChange = useDynamicDebouncedCallback(
    onChange,
    [onChange],
    (val) => (isFastSlice?.(val) ? SHORT_DELAY : LONG_DELAY),
  );

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
          <Slider.Root
            className={styles.slider}
            min={0}
            max={length - 1}
            step={1}
            orientation="vertical"
            value={value}
            onValueChange={(newValue) => {
              setValue(newValue);
              onDebouncedChange(newValue);
            }}
          >
            <Slider.Control className={styles.control}>
              <Slider.Track className={styles.track}>
                {containerSize &&
                  containerSize.height / length >= MIN_HEIGHT_PER_MARK &&
                  Array.from({ length }, (_, index) => (
                    <span
                      key={index}
                      className={styles.mark}
                      style={{ bottom: `${(index / (length - 1)) * 100}%` }}
                    />
                  ))}
                <Slider.Thumb
                  className={styles.thumb}
                  aria-labelledby={sliderLabelId}
                >
                  <span className={styles.thumbValue}>{value}</span>
                </Slider.Thumb>
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>

          {withControls && (
            <div className={styles.slicingControls}>
              <Btn
                label="Next slice"
                Icon={FiChevronUp}
                iconOnly
                small
                onClick={() => {
                  const newValue = Math.min(value + stride, length - 1);
                  setValue(newValue);
                  onDebouncedChange(newValue);
                }}
              />
              <Btn
                label="Previous slice"
                Icon={FiChevronDown}
                iconOnly
                small
                onClick={() => {
                  const newValue = Math.max(value - stride, 0);
                  setValue(newValue);
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
