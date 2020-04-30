import React from 'react';
import ReactSlider from 'react-slider';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import { round } from 'lodash-es';
import { FiRotateCcw } from 'react-icons/fi';
import styles from './DomainSlider.module.css';
import { useHeatmapConfig } from './config';
import { Domain } from './models';

const EXTEND_PERCENTAGE = 0.2;
const NB_DECIMALS = 1;

function DomainSlider(): JSX.Element {
  const [
    dataDomain,
    customDomain,
    setCustomDomain,
  ] = useHeatmapConfig(state => [
    state.dataDomain,
    state.customDomain,
    state.setCustomDomain,
    shallow,
  ]);

  if (!dataDomain) {
    return <></>;
  }

  const [min, max] = dataDomain;
  const extension = (max - min) * EXTEND_PERCENTAGE;
  const extendedMin = min - extension;
  const extendedMax = max + extension;
  const step = Math.max((extendedMax - extendedMin) / 100, 10 ** -NB_DECIMALS);

  return (
    <div className={styles.sliderWrapper}>
      <button
        className={styles.resetButton}
        type="button"
        onClick={() => setCustomDomain(undefined)}
        disabled={!customDomain}
      >
        <FiRotateCcw />
      </button>
      <ReactSlider
        className={styles.slider}
        trackClassName={styles.sliderTrack}
        thumbClassName={styles.sliderThumb}
        renderThumb={(props, state) => (
          <div {...props}>{format(`.${NB_DECIMALS}f`)(state.valueNow)}</div>
        )}
        value={[...(customDomain || dataDomain)]}
        min={extendedMin}
        max={extendedMax}
        step={step}
        pearling
        onAfterChange={values => {
          const roundedDomain = (values as number[]).map(value =>
            round(value, NB_DECIMALS)
          ) as Domain;
          setCustomDomain(roundedDomain);
        }}
      />
    </div>
  );
}

export default DomainSlider;
