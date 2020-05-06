import React from 'react';
import ReactSlider from 'react-slider';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import { round, debounce } from 'lodash-es';
import { FiRotateCcw } from 'react-icons/fi';
import styles from './DomainSlider.module.css';
import { useHeatmapConfig } from './config';
import { Domain } from '../shared/models';
import { extendDomain } from '../shared/utils';

const EXTEND_FACTOR = 0.2;
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

  const [extendedMin, extendedMax] = extendDomain(dataDomain, EXTEND_FACTOR);
  const step = Math.max((extendedMax - extendedMin) / 100, 10 ** -NB_DECIMALS);

  const updateCustomDomain = debounce(values => {
    const roundedDomain = (values as number[]).map(value =>
      round(value, NB_DECIMALS)
    ) as Domain;
    setCustomDomain(roundedDomain);
  }, 500);

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
        key={JSON.stringify(customDomain || dataDomain)}
        className={styles.slider}
        trackClassName={styles.sliderTrack}
        thumbClassName={styles.sliderThumb}
        renderThumb={(props, state) => (
          <div {...props}>{format(`.${NB_DECIMALS}f`)(state.valueNow)}</div>
        )}
        defaultValue={[...(customDomain || dataDomain)]}
        onChange={updateCustomDomain}
        min={extendedMin}
        max={extendedMax}
        step={step}
        pearling
      />
    </div>
  );
}

export default DomainSlider;
