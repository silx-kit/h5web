import { Fragment, ReactElement, Ref, useState } from 'react';
import { FiSkipBack, FiSkipForward } from 'react-icons/fi';
import ReactSlider from 'react-slider';
import { createAxisScale, extendDomain } from '../../../vis-packs/core/utils';
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
  disabled?: boolean;
  isAutoMin: boolean;
  isAutoMax: boolean;
  onChange: (newValue: Domain) => void;
  onAfterChange: (hasMinChanged: boolean, hasMaxChanged: boolean) => void;
}

function ScaledSlider(props: Props): ReactElement {
  const {
    value,
    dataDomain,
    safeVisDomain,
    scaleType,
    errors,
    disabled,
    isAutoMin,
    isAutoMax,
  } = props;
  const { onChange, onAfterChange: onDone } = props;
  const { minGreater, minError, maxError } = errors;

  const sliderExtent = extendDomain(safeVisDomain, EXTEND_FACTOR, scaleType);
  const scale = createAxisScale({
    type: scaleType,
    domain: sliderExtent,
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
      disabled={disabled}
      onBeforeChange={(bounds) => setBeforeChangeValue(bounds as Domain)}
      onChange={(bounds) => handleChange(bounds as Domain)}
      onAfterChange={(bounds) => handleChange(bounds as Domain, true)}
      renderThumb={({ ref, ...thumbProps }, { index }) => (
        <Thumb
          ref={ref as Ref<HTMLDivElement>}
          isAuto={index === 0 ? isAutoMin : isAutoMax}
          hasError={minGreater || (index === 0 ? !!minError : !!maxError)}
          AutoIcon={index === 0 ? FiSkipBack : FiSkipForward}
          disabled={disabled}
          {...thumbProps}
        />
      )}
      renderTrack={({ key }, { index }) =>
        index === 0 ? (
          <Track key={key} scale={scale} dataDomain={dataDomain} />
        ) : (
          <Fragment key={key} />
        )
      }
    />
  );
}

export default ScaledSlider;
