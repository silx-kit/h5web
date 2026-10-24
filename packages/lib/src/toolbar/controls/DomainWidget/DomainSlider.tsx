import { type ColorScaleType, type Domain } from '@h5web/shared/vis-models';
import { useRef } from 'react';
import { FiSkipBack, FiSkipForward } from 'react-icons/fi';

import { getSafeDomain } from '../../../vis/heatmap/utils';
import { useCombinedDomain } from '../../../vis/hooks';
import { type DomainErrors } from '../../../vis/models';
import { clampBound, createScale, extendDomain } from '../../../vis/utils';
import { useSliderDrag } from '../hooks';
import { handleSliderKey } from '../utils';
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

  const { trackRef, dragProps } = useSliderDrag(
    false,
    SLIDER_RANGE,
    (val, pressedIndex) => {
      const closest = val * 2 < scaledValue[0] + scaledValue[1] ? 0 : 1;
      return disabled ? undefined : pressedIndex >= 0 ? pressedIndex : closest;
    },
    moveThumb,
    endChange,
  );

  return (
    <div ref={trackRef} className={styles.slider} {...dragProps}>
      <Track scale={scale} dataDomain={dataDomain} />
      {scaledValue.map((scaledBound, index) => (
        <Thumb
          key={index === 0 ? 'min' : 'max'}
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
          onKeyDown={(evt) =>
            handleSliderKey(evt, scaledBound, ...SLIDER_RANGE, (newBound) =>
              moveThumb(newBound, index),
            )
          }
          onKeyUp={endChange}
          onBlur={endChange}
        />
      ))}
    </div>
  );
}

export type { Props as DomainSliderProps };
export default DomainSlider;
