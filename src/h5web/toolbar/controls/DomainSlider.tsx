import type { ReactElement } from 'react';
import ReactSlider from 'react-slider';
import { format } from 'd3-format';
import styles from './DomainSlider.module.css';
import type { Domain } from '../../vis-packs/core/models';
import { extendDomain } from '../../vis-packs/core/utils';
import ToggleBtn from './ToggleBtn';
import { FiZap } from 'react-icons/fi';

const EXTEND_FACTOR = 0.2;
const NB_DECIMALS = 1;

interface Props {
  dataDomain: Domain;
  value?: Domain;
  disabled?: boolean;
  onChange: (value: Domain | undefined) => void;
}

function DomainSlider(props: Props): ReactElement {
  const { dataDomain, value, disabled, onChange } = props;

  const [extendedMin, extendedMax] = extendDomain(dataDomain, EXTEND_FACTOR);
  const step = Math.max((extendedMax - extendedMin) / 100, 10 ** -NB_DECIMALS);

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
        value={[...(value || dataDomain)]}
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
        label="Auto"
        icon={FiZap}
        value={value === undefined}
        onChange={() => {
          onChange(value === undefined ? dataDomain : undefined);
        }}
        disabled={disabled}
      />
    </div>
  );
}

export default DomainSlider;
