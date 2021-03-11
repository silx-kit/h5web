import { Fragment, ReactElement, Ref } from 'react';
import { FiSkipBack, FiSkipForward } from 'react-icons/fi';
import ReactSlider from 'react-slider';
import { useBoolean } from 'react-use';
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
  onChange: (
    newValue: Domain,
    hasMinChanged: boolean,
    hasMaxChanged: boolean
  ) => void;
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
  const { minError, maxError } = errors;

  const sliderExtent = extendDomain(safeVisDomain, EXTEND_FACTOR, scaleType);

  const [hasMinChanged, setMinChanged] = useBoolean(false);
  const [hasMaxChanged, setMaxChanged] = useBoolean(false);

  const scale = createAxisScale({
    type: scaleType,
    domain: sliderExtent,
    range: SLIDER_RANGE,
    clamp: true,
  });

  const [safeValue] = getSafeDomain(value, dataDomain, scaleType);
  const scaledValue = safeValue.map(scale).map(Math.round) as Domain;

  function handleChange(newScaledValue: Domain) {
    const [newScaledMin, newScaledMax] = newScaledValue;
    const hasMinChanged = newScaledMin !== scaledValue[0];
    const hasMaxChanged = newScaledMax !== scaledValue[1];

    const newValue: Domain = [
      hasMinChanged ? scale.invert(newScaledMin) : safeValue[0],
      hasMaxChanged ? scale.invert(newScaledMax) : safeValue[1],
    ];

    onChange(newValue, hasMinChanged, hasMaxChanged);
    setMinChanged(hasMinChanged);
    setMaxChanged(hasMaxChanged);
  }

  function handleAfterChange() {
    onDone(hasMinChanged, hasMaxChanged);
    setMinChanged(false);
    setMaxChanged(false);
  }

  return (
    <ReactSlider
      className={styles.slider}
      pearling
      min={SLIDER_RANGE[0]}
      max={SLIDER_RANGE[1]}
      value={scaledValue}
      disabled={disabled}
      onChange={(bounds) => handleChange(bounds as Domain)}
      onAfterChange={handleAfterChange}
      renderThumb={({ ref, ...thumbProps }, { index }) => (
        <Thumb
          ref={ref as Ref<HTMLDivElement>}
          isAuto={index === 0 ? isAutoMin : isAutoMax}
          hasError={index === 0 ? !!minError : !!maxError}
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
