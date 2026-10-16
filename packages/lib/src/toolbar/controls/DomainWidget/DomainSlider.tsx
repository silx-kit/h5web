import { type ColorScaleType, type Domain } from '@h5web/shared/vis-models';
import { useRef } from 'react';
import { FiSkipBack, FiSkipForward } from 'react-icons/fi';

import { getSafeDomain } from '../../../vis/heatmap/utils';
import { useCombinedDomain } from '../../../vis/hooks';
import { type DomainErrors } from '../../../vis/models';
import { clampBound, createScale, extendDomain } from '../../../vis/utils';
import Slider from '../Slider';
import styles from './DomainSlider.module.css';
import Thumb from './Thumb';
import Track from './Track';

const SLIDER_RANGE: Domain = [1, 100];
const EXTEND_FACTOR = 0.3;

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

  const beforeChangeRef = useRef([value, scaledValue]); // updated when interaction starts

  function handleChange(newScaledValue: Domain, done = false) {
    const [beforeValue, beforeChangeValue] = beforeChangeRef.current;
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

  return (
    <Slider
      className={styles.slider}
      trackClassName={styles.track}
      min={SLIDER_RANGE[0]}
      max={SLIDER_RANGE[1]}
      value={scaledValue}
      disabled={disabled}
      onBeforeChange={() => {
        beforeChangeRef.current = [value, scaledValue];
      }}
      onChange={(bounds) => handleChange(bounds)}
      onAfterChange={(bounds) => handleChange(bounds, true)}
      renderThumb={(index, thumbProps) => (
        <Thumb
          key={index}
          bound={index === 0 ? 'min' : 'max'}
          isAuto={index === 0 ? isAutoMin : isAutoMax}
          hasError={minGreater || (index === 0 ? !!minError : !!maxError)}
          disabled={disabled}
          AutoIcon={index === 0 ? FiSkipBack : FiSkipForward}
          {...thumbProps}
        />
      )}
    >
      <Track scale={scale} dataDomain={dataDomain} />
    </Slider>
  );
}

export type { Props as DomainSliderProps };
export default DomainSlider;
