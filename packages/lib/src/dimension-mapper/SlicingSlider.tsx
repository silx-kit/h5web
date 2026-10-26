import { assertNonNull } from '@h5web/shared/guards';
import { useMeasure } from '@react-hookz/web';
import {
  type KeyboardEvent,
  type PointerEvent,
  useId,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

import Btn from '../toolbar/controls/Btn';
import { useDynamicDebouncedCallback } from './hooks';
import styles from './SlicingSlider.module.css';

const ID = 'h5w-slider';
const MIN_HEIGHT_PER_MARK = 25;
const SHORT_DELAY = 20;
const LONG_DELAY = 250;

const KEY_STEPS: Partial<Record<string, number>> = {
  ArrowDown: -1,
  ArrowLeft: -1,
  ArrowUp: 1,
  ArrowRight: 1,
  PageDown: -10,
  PageUp: 10,
  Home: -Infinity,
  End: Infinity,
};

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

  function handleChange(newValue: number) {
    if (newValue !== localValue) {
      setLocalValue(newValue);
      onDebouncedChange(newValue);
    }
  }

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; offset: number }>(undefined); // offset between pointer and thumb center

  function getValueAt(clientY: number): number {
    assertNonNull(trackRef.current);
    const { bottom, height } = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((bottom - clientY) / height, 0), 1);
    return Math.round(ratio * (length - 1));
  }

  function handlePointerDown(evt: PointerEvent<HTMLDivElement>) {
    assertNonNull(thumbRef.current);
    if (evt.button !== 0 || dragRef.current) {
      return;
    }

    const { top, height } = thumbRef.current.getBoundingClientRect();
    const offset = thumbRef.current.contains(evt.target as Node)
      ? evt.clientY - (top + height / 2) // grabbed thumb doesn't jump
      : 0;

    evt.preventDefault(); // prevent text selection
    thumbRef.current.focus({ preventScroll: true });
    evt.currentTarget.setPointerCapture(evt.pointerId);
    dragRef.current = { pointerId: evt.pointerId, offset };
    handleChange(getValueAt(evt.clientY - offset));
  }

  function handlePointerMove(evt: PointerEvent) {
    if (dragRef.current?.pointerId === evt.pointerId) {
      const { offset } = dragRef.current;
      flushSync(() => handleChange(getValueAt(evt.clientY - offset))); // render before next move so `localValue` is up to date
    }
  }

  function handleKeyDown(evt: KeyboardEvent) {
    const step = KEY_STEPS[evt.key];
    if (step !== undefined) {
      evt.preventDefault();
      handleChange(Math.min(Math.max(localValue + step, 0), length - 1));
    }
  }

  const [containerSize, containerRef] = useMeasure<HTMLDivElement>();
  const sliderLabelId = `${ID}-${dimension}-label`;
  const thumbValue = Math.min(Math.max(localValue, 0), length - 1);

  return (
    <div key={dimension} ref={containerRef} className={styles.container}>
      <span id={sliderLabelId} className={styles.label}>
        D{dimension}
      </span>
      <span className={styles.sublabel}>0:{length - 1}</span>
      {length > 1 && (
        <>
          <div
            className={styles.slider}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onLostPointerCapture={(evt) => {
              if (dragRef.current?.pointerId === evt.pointerId) {
                dragRef.current = undefined;
              }
            }}
          >
            <div ref={trackRef} className={styles.track}>
              {containerSize &&
                containerSize.height / length >= MIN_HEIGHT_PER_MARK &&
                Array.from({ length }, (_, index) => (
                  <span
                    key={index}
                    className={styles.mark}
                    style={{ bottom: `${(index / (length - 1)) * 100}%` }}
                  />
                ))}
              <div
                ref={thumbRef}
                className={styles.thumb}
                style={{ bottom: `${(thumbValue / (length - 1)) * 100}%` }}
                role="slider"
                tabIndex={0}
                aria-labelledby={sliderLabelId}
                aria-valuemin={0}
                aria-valuemax={length - 1}
                aria-valuenow={thumbValue}
                aria-orientation="vertical"
                onKeyDown={handleKeyDown}
              >
                <span className={styles.thumbValue}>{localValue}</span>
              </div>
            </div>
          </div>

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
