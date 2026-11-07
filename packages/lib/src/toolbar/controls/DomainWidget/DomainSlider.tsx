import { assertNonNull } from '@h5web/shared/guards';
import { type ColorScaleType, type Domain } from '@h5web/shared/vis-models';
import { type PointerEvent, useRef } from 'react';
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

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<{
    pointerId: number;
    index: number;
    offset: number;
    rect: DOMRect;
  }>(undefined); // offset between pointer and thumb center; track rect measured once per drag

  function getValueAt(clientX: number, rect: DOMRect): number {
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return Math.round(SLIDER_RANGE[0] + ratio * SLIDER_SPAN);
  }

  function handlePointerDown(evt: PointerEvent<HTMLDivElement>) {
    if (disabled || evt.button !== 0 || dragRef.current) {
      return;
    }

    // Grab pressed thumb without making it jump, or else move closest thumb
    const { target } = evt;
    const pressedThumb = thumbsRef.current.find(
      (thumb) => target instanceof Node && thumb?.contains(target),
    );
    assertNonNull(trackRef.current);
    const rect = trackRef.current.getBoundingClientRect();
    let index: number;
    let offset = 0;
    if (pressedThumb) {
      const { left, width } = pressedThumb.getBoundingClientRect();
      index = thumbsRef.current.indexOf(pressedThumb);
      offset = evt.clientX - (left + width / 2);
    } else {
      const [min, max] = scaledValue;
      index = getValueAt(evt.clientX, rect) * 2 < min + max ? 0 : 1;
    }

    evt.preventDefault(); // prevent text selection
    thumbsRef.current[index]?.focus({ preventScroll: true });
    evt.currentTarget.setPointerCapture(evt.pointerId);
    dragRef.current = { pointerId: evt.pointerId, index, offset, rect };
    moveThumb(getValueAt(evt.clientX - offset, rect), index);
  }

  function handlePointerMove(evt: PointerEvent) {
    if (dragRef.current?.pointerId === evt.pointerId) {
      const { index, offset, rect } = dragRef.current;
      moveThumb(getValueAt(evt.clientX - offset, rect), index);
    }
  }

  return (
    <div
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
      <Track ref={trackRef} scale={scale} dataDomain={dataDomain}>
        {scaledValue.map((scaledBound, index) => (
          <Thumb
            key={index === 0 ? 'min' : 'max'}
            ref={(thumb) => {
              thumbsRef.current[index] = thumb;
            }}
            bound={index === 0 ? 'min' : 'max'}
            value={scaledBound}
            range={SLIDER_RANGE}
            isAuto={index === 0 ? isAutoMin : isAutoMax}
            hasError={minGreater || (index === 0 ? !!minError : !!maxError)}
            disabled={disabled}
            AutoIcon={index === 0 ? FiSkipBack : FiSkipForward}
            onChange={(newBound) => moveThumb(newBound, index)}
            onEnd={endChange}
          />
        ))}
      </Track>
    </div>
  );
}

export type { Props as DomainSliderProps };
export default DomainSlider;
