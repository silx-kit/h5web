import type { ReactElement, Ref } from 'react';
import { FiSkipBack, FiSkipForward } from 'react-icons/fi';
import ReactSlider from 'react-slider';
import { Domain, extendDomain, ScaleType } from '../../../../packages/lib';
import { createAxisScale } from '../../../vis-packs/core/utils';
import styles from './DomainSlider.module.css';
import Thumb from './Thumb';

const SLIDER_RANGE: Domain = [1, 100];
const EXTEND_FACTOR = 0.2;

interface Props {
  value: Domain;
  dataDomain: Domain;
  disabled?: boolean;
  isAutoMin: boolean;
  isAutoMax: boolean;
  onChange: (domain: Domain) => void;
  onAfterChange: (domain: Domain) => void;
}

function ScaledSlider(props: Props): ReactElement {
  const { value, dataDomain, disabled, isAutoMin, isAutoMax } = props;
  const { onChange, onAfterChange } = props;

  const sliderExtent = extendDomain(dataDomain, EXTEND_FACTOR);

  const scale = createAxisScale({
    type: ScaleType.Linear,
    domain: sliderExtent,
    range: SLIDER_RANGE,
    round: true,
  });

  return (
    <ReactSlider
      className={styles.slider}
      trackClassName={styles.track}
      thumbClassName={styles.thumb}
      thumbActiveClassName={styles.thumbActive}
      pearling
      min={SLIDER_RANGE[0]}
      max={SLIDER_RANGE[1]}
      value={value.map(scale) as Domain}
      disabled={disabled}
      onChange={(bounds) => {
        onChange((bounds as Domain).map((val) => scale.invert(val)) as Domain);
      }}
      onAfterChange={(bounds) => {
        onAfterChange(
          (bounds as Domain).map((val) => scale.invert(val)) as Domain
        );
      }}
      renderThumb={({ ref, ...thumbProps }, { index }) => (
        <Thumb
          ref={ref as Ref<HTMLDivElement>}
          isAuto={index === 0 ? isAutoMin : isAutoMax}
          AutoIcon={index === 0 ? FiSkipBack : FiSkipForward}
          disabled={disabled}
          {...thumbProps}
        />
      )}
    />
  );
}

export default ScaledSlider;
