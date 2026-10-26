import { assertNonNull } from '@h5web/shared/guards';
import { type ColorScaleType, type Domain } from '@h5web/shared/vis-models';
import { type KeyboardEvent, type PointerEvent, useRef } from 'react';
import { flushSync } from 'react-dom';
import { FiSkipBack, FiSkipForward } from 'react-icons/fi';

import { getSafeDomain } from '../../../vis/heatmap/utils';
import { useCombinedDomain } from '../../../vis/hooks';
import { type DomainErrors } from '../../../vis/models';
import { clampBound, createScale, extendDomain } from '../../../vis/utils';
import styles from './DomainSlider.module.css';
import Thumb from './Thumb';
import Track from './Track';

const SLIDER_RANGE: Domain = [1, 100];
const EXTEND_FACTOR = 0.3;
const SLIDER_SPAN = SLIDER_RANGE[1] - SLIDER_RANGE[0];

const KEY_STEPS: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
  PageDown: -10,
  PageUp: 10,
  Home: -Infinity,
  End: Infinity,
};

interface Props {
  value: Domain;
  dataDomain: Domain;
  safeVisDomain: Domain;
  scaleType: ColorScaleType;
  errors: DomainErrors;
  isAutoMin: boolean;
  isAutoMax: boolean;
  disabled?: boolean;
  onChange: (newValue: Domain) => void;
  onAfterChange: (hasMinChanged: boolean, hasMaxChanged: boolean) => void;
}

function DomainSlider(props: Props) {
  const {
    value,
    dataDomain,
    safeVisDomain,
    scaleType,
    errors,
    isAutoMin,
    isAutoMax,
    disabled = false,
  } = props;
  const { onChange, onAfterChange: onDone } = props;
  const { minGreater, minError, maxError } = errors;

  const sliderDomain = useCombinedDomain([safeVisDomain, dataDomain]);
  const sliderExtent = extendDomain(sliderDomain, EXTEND_FACTOR, scaleType);
  const scale = createScale(scaleType, {
    domain: sliderExtent.map((val) => clampBound(val)),
    range: SLIDER_RANGE,
    clamp: true,
  });

  const [safeValue] = getSafeDomain(value, dataDomain, scaleType);
  const scaledValue = safeValue.map(scale).map(Math.round) as Domain;

  const beforeChangeRef = useRef<[Domain, Domain]>(undefined); // value and scaled value when interaction started

  function handleChange(newScaledValue: Domain, done = false) {
    const [beforeValue, beforeChangeValue] = beforeChangeRef.current ?? [
      value,
      scaledValue,
    ];
    const [newScaledMin, newScaledMax] = newScaledValue;
    const hasMinChanged = newScaledMin !== beforeChangeValue[0];
    const hasMaxChanged = newScaledMax !== beforeChangeValue[1];

    const newValue: Domain = [
      hasMinChanged ? scale.invert(newScaledMin) : beforeValue[0],
      hasMaxChanged ? scale.invert(newScaledMax) : beforeValue[1],
    ];

    if (done) {
      onDone(hasMinChanged, hasMaxChanged);
    } else {
      onChange(newValue);
    }
  }

  // Move thumb and let it push the other thumb if needed
  function moveThumb(bound: number, index: number) {
    const [min, max] = scaledValue;
    const newScaledValue: Domain =
      index === 0
        ? [bound, Math.max(bound, max)]
        : [Math.min(min, bound), bound];

    if (!disabled && (newScaledValue[0] !== min || newScaledValue[1] !== max)) {
      beforeChangeRef.current = beforeChangeRef.current ?? [value, scaledValue];
      handleChange(newScaledValue);
    }
  }

  function endChange() {
    if (beforeChangeRef.current) {
      handleChange(scaledValue, true);
      beforeChangeRef.current = undefined;
    }
  }

  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<{ pointerId: number; index: number; offset: number }>(
    undefined,
  ); // offset between pointer and thumb center

  function getBoundAt(clientX: number): number {
    assertNonNull(sliderRef.current);
    const { left, width } = sliderRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - left) / width, 0), 1);
    return Math.round(SLIDER_RANGE[0] + ratio * SLIDER_SPAN);
  }

  function handlePointerDown(evt: PointerEvent<HTMLDivElement>) {
    if (disabled || evt.button !== 0 || dragRef.current) {
      return;
    }

    // Grab pressed thumb without making it jump, or else move closest thumb
    const pressedThumb = thumbsRef.current.find((thumb) =>
      thumb?.contains(evt.target as Node),
    );
    let index: number;
    let offset = 0;
    if (pressedThumb) {
      const { left, width } = pressedThumb.getBoundingClientRect();
      index = thumbsRef.current.indexOf(pressedThumb);
      offset = evt.clientX - (left + width / 2);
    } else {
      const [min, max] = scaledValue;
      index = getBoundAt(evt.clientX) * 2 < min + max ? 0 : 1;
    }

    evt.preventDefault(); // prevent text selection
    thumbsRef.current[index]?.focus({ preventScroll: true });
    evt.currentTarget.setPointerCapture(evt.pointerId);
    dragRef.current = { pointerId: evt.pointerId, index, offset };
    moveThumb(getBoundAt(evt.clientX - offset), index);
  }

  function handlePointerMove(evt: PointerEvent) {
    if (dragRef.current?.pointerId === evt.pointerId) {
      const { index, offset } = dragRef.current;
      flushSync(() => moveThumb(getBoundAt(evt.clientX - offset), index)); // render before next move so `scaledValue` is up to date
    }
  }

  function handleKeyDown(evt: KeyboardEvent, index: number) {
    const step = KEY_STEPS[evt.key];
    if (step !== undefined) {
      evt.preventDefault();
      const bound = scaledValue[index] + step;
      moveThumb(
        Math.min(Math.max(bound, SLIDER_RANGE[0]), SLIDER_RANGE[1]),
        index,
      );
    }
  }

  return (
    <div
      ref={sliderRef}
      className={styles.slider}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onLostPointerCapture={(evt) => {
        if (dragRef.current?.pointerId === evt.pointerId) {
          dragRef.current = undefined;
          endChange();
        }
      }}
    >
      <Track scale={scale} dataDomain={dataDomain} />
      {scaledValue.map((scaledBound, index) => (
        <Thumb
          key={index === 0 ? 'min' : 'max'}
          ref={(thumb) => {
            thumbsRef.current[index] = thumb;
          }}
          bound={index === 0 ? 'min' : 'max'}
          isAuto={index === 0 ? isAutoMin : isAutoMax}
          hasError={minGreater || (index === 0 ? !!minError : !!maxError)}
          disabled={disabled}
          AutoIcon={index === 0 ? FiSkipBack : FiSkipForward}
          style={{
            left: `${((scaledBound - SLIDER_RANGE[0]) / SLIDER_SPAN) * 100}%`,
          }}
          role="slider"
          tabIndex={0}
          aria-valuemin={SLIDER_RANGE[0]}
          aria-valuemax={SLIDER_RANGE[1]}
          aria-valuenow={scaledBound}
          onKeyDown={(evt) => handleKeyDown(evt, index)}
          onKeyUp={endChange}
          onBlur={endChange}
        />
      ))}
    </div>
  );
}

export type { Props as DomainSliderProps };
export default DomainSlider;
