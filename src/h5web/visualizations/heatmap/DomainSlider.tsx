import React from 'react';
import ReactSlider from 'react-slider';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import { round } from 'lodash-es';
import styles from './DomainSlider.module.css';
import { useHeatmapStore, Domain, selectGetExtendedDomain } from './store';

const EXTEND_PERCENTAGE = 0.2;
const MIN_DECIMALS = 1;

function DomainSlider(): JSX.Element {
  const [customDomain, setCustomDomain] = useHeatmapStore(state => [
    state.customDomain,
    state.setCustomDomain,
    shallow,
  ]);
  const getExtendedDomain = useHeatmapStore(selectGetExtendedDomain);
  const extendedDomain = getExtendedDomain(EXTEND_PERCENTAGE);

  if (extendedDomain === undefined) {
    return <></>;
  }

  const step = Math.max(
    (extendedDomain[1] - extendedDomain[0]) / 100,
    10 ** -MIN_DECIMALS
  );

  return (
    <ReactSlider
      className={styles.slider}
      trackClassName={styles.sliderTrack}
      thumbClassName={styles.sliderThumb}
      renderThumb={(props, state) => (
        <div {...props}>{format(`.${MIN_DECIMALS}f`)(state.valueNow)}</div>
      )}
      defaultValue={customDomain}
      min={extendedDomain[0]}
      max={extendedDomain[1]}
      step={step}
      pearling
      onAfterChange={values => {
        const roundedValues = (values as Domain).map(value =>
          round(value, MIN_DECIMALS)
        );
        setCustomDomain(roundedValues as Domain);
      }}
    />
  );
}

export default DomainSlider;
