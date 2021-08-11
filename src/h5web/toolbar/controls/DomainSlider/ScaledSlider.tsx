import { useState } from 'react';
import { FiSkipBack, FiSkipForward } from 'react-icons/fi';
import ReactSlider from 'react-slider';
import {
  clampBound,
  createAxisScale,
  extendDomain,
} from '../../../vis-packs/core/utils';
import type {
  Domain,
  DomainErrors,
  ScaleType,
} from '../../../vis-packs/core/models';
import styles from './DomainSlider.module.css';
import Thumb from './Thumb';
import Track from './Track';
import { getSafeDomain } from '../../../vis-packs/core/heatmap/utils';

const SLIDER_RANGE: Domain = [1, 100];
const EXTEND_FACTOR = 0.3;

interface Props {
  value: Domain;
  dataDomain: Domain;
  safeVisDomain: Domain;
  scaleType: ScaleType;
  errors: DomainErrors;
  isAutoMin: boolean;
  isAutoMax: boolean;
  onChange: (newValue: Domain) => void;
  onAfterChange: (hasMinChanged: boolean, hasMaxChanged: boolean) => void;
}

function ScaledSlider(props: Props) {
  const {
    value,
    dataDomain,
    safeVisDomain,
    scaleType,
    errors,
    isAutoMin,
    isAutoMax,
  } = props;
  const { onChange, onAfterChange: onDone } = props;
  const { minGreater, minError, maxError } = errors;

  const sliderExtent = extendDomain(safeVisDomain, EXTEND_FACTOR, scaleType);
  const scale = createAxisScale(scaleType, {
    domain: sliderExtent.map((val) => clampBound(val)),
    range: SLIDER_RANGE,
    clamp: true,
  });

  const [safeValue] = getSafeDomain(value, dataDomain, scaleType);
  const scaledValue = safeValue.map(scale).map(Math.round) as Domain;

  const [beforeChangeValue, setBeforeChangeValue] = useState(scaledValue);

  function handleChange(newScaledValue: Domain, done = false) {
    const [newScaledMin, newScaledMax] = newScaledValue;
    const hasMinChanged = newScaledMin !== beforeChangeValue[0];
    const hasMaxChanged = newScaledMax !== beforeChangeValue[1];

    const newValue: Domain = [
      hasMinChanged ? scale.invert(newScaledMin) : value[0],
      hasMaxChanged ? scale.invert(newScaledMax) : value[1],
    ];

    if (done) {
      onDone(hasMinChanged, hasMaxChanged);
    } else {
      onChange(newValue);
    }
  }

  return (
    <ReactSlider
      className={styles.slider}
      pearling
      min={SLIDER_RANGE[0]}
      max={SLIDER_RANGE[1]}
      value={scaledValue}
      onBeforeChange={setBeforeChangeValue}
      onChange={(bounds) => handleChange(bounds)}
      onAfterChange={(bounds) => handleChange(bounds, true)}
      renderThumb={(thumbProps, { index }) => (
        <Thumb
          bound={index === 0 ? 'min' : 'max'}
          isAuto={index === 0 ? isAutoMin : isAutoMax}
          hasError={minGreater || (index === 0 ? !!minError : !!maxError)}
          AutoIcon={index === 0 ? FiSkipBack : FiSkipForward}
          {...thumbProps}
        />
      )}
      renderTrack={({ key }, { index }) =>
        index === 0 ? (
          <Track key={key} scale={scale} dataDomain={dataDomain} />
        ) : null
      }
    />
  );
}

export default ScaledSlider;
