import type { ReactElement } from 'react';
import ReactSlider from 'react-slider';
import { format } from 'd3-format';
import styles from './DomainSlider.module.css';
import type { CustomDomain, Domain } from '../../vis-packs/core/models';
import { extendDomain } from '../../vis-packs/core/utils';
import ToggleBtn from './ToggleBtn';
import { FiZap } from 'react-icons/fi';

const EXTEND_FACTOR = 0.2;
const NB_DECIMALS = 1;

interface Props {
  dataDomain: Domain;
  value: CustomDomain;
  disabled?: boolean;
  onChange: (value: CustomDomain) => void;
}

function DomainSlider(props: Props): ReactElement {
  const { dataDomain, value, disabled, onChange } = props;

  const [extendedMin, extendedMax] = extendDomain(dataDomain, EXTEND_FACTOR);
  const step = Math.max((extendedMax - extendedMin) / 100, 10 ** -NB_DECIMALS);

  const isAutoMin = value[0] === undefined;
  const isAutoMax = value[1] === undefined;
  const isAutoScaling = isAutoMin || isAutoMax;

  return (
    <div className={styles.sliderWrapper}>
      <ReactSlider
        className={styles.slider}
        disabled={disabled}
        trackClassName={styles.track}
        thumbClassName={styles.thumb}
        thumbActiveClassName={styles.thumbActive}
        renderThumb={(thumbProps, { valueNow }) => (
          <div {...thumbProps} tabIndex={disabled ? -1 : 0}>
            <div className={styles.thumbBtnLike}>
              {format(`.${NB_DECIMALS}f`)(valueNow)}
            </div>
          </div>
        )}
        value={[value[0] ?? dataDomain[0], value[1] ?? dataDomain[1]]}
        onAfterChange={(bounds) => {
          onChange(bounds as Domain);
        }}
        min={extendedMin}
        max={extendedMax}
        step={step}
        pearling
      />

      <ToggleBtn
        small
        label={`Auto${
          isAutoMin && !isAutoMax
            ? ' (min)'
            : isAutoMax && !isAutoMin
            ? ' (max)'
            : ''
        }`}
        icon={FiZap}
        value={isAutoScaling}
        onChange={() => {
          onChange(isAutoScaling ? dataDomain : [undefined, undefined]);
        }}
        disabled={disabled}
      />
    </div>
  );
}

export default DomainSlider;
