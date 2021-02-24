import type { ReactElement } from 'react';
import ReactSlider from 'react-slider';
import styles from './DomainSlider.module.css';
import type { CustomDomain, Domain } from '../../../vis-packs/core/models';
import { extendDomain } from '../../../vis-packs/core/utils';
import ToggleBtn from '../ToggleBtn';
import { FiZap } from 'react-icons/fi';
import { useKey, useToggle } from 'react-use';
import DomainTooltip from './DomainTooltip';
import { format } from 'd3-format';

const EXTEND_FACTOR = 0.2;
const NB_DECIMALS = 1;
const TOOLTIP_ID = 'domain-tooltip';

const formatThumb = format(`.1f`);

function getAutoscaleLabel(isAutoMin: boolean, isAutoMax: boolean): string {
  if (isAutoMin && !isAutoMax) {
    return 'Min';
  }

  if (isAutoMax && !isAutoMin) {
    return 'Max';
  }

  return 'Auto';
}

interface Props {
  dataDomain: Domain;
  value: CustomDomain;
  disabled?: boolean;
  onChange: (value: CustomDomain) => void;
}

function DomainSlider(props: Props): ReactElement {
  const { dataDomain, value, disabled, onChange } = props;

  const [tooltipOpen, toggleTooltip] = useToggle(false);
  useKey('Escape', () => toggleTooltip(false));

  const [extendedMin, extendedMax] = extendDomain(dataDomain, EXTEND_FACTOR);
  const step = Math.max((extendedMax - extendedMin) / 100, 10 ** -NB_DECIMALS);

  const isAutoMin = value[0] === undefined;
  const isAutoMax = value[1] === undefined;

  const domain: Domain = [value[0] ?? dataDomain[0], value[1] ?? dataDomain[1]];

  function handleAutoscaleToggle(toggleMin = true, toggleMax = true) {
    onChange([
      toggleMin ? (isAutoMin ? dataDomain[0] : undefined) : value[0],
      toggleMax ? (isAutoMax ? dataDomain[1] : undefined) : value[1],
    ]);
  }

  return (
    <div
      className={styles.root}
      aria-expanded={tooltipOpen}
      aria-describedby={TOOLTIP_ID}
      onPointerEnter={() => toggleTooltip(true)}
      onPointerLeave={() => toggleTooltip(false)}
    >
      <ReactSlider
        className={styles.slider}
        trackClassName={styles.track}
        thumbClassName={styles.thumb}
        thumbActiveClassName={styles.thumbActive}
        pearling
        value={domain}
        min={extendedMin}
        max={extendedMax}
        step={step}
        disabled={disabled}
        onAfterChange={(bounds) => onChange(bounds as Domain)}
        renderThumb={(thumbProps, { valueNow }) => (
          <div {...thumbProps} tabIndex={disabled ? -1 : 0}>
            <div className={styles.thumbBtnLike}>{formatThumb(valueNow)}</div>
          </div>
        )}
      />

      <ToggleBtn
        small
        label={getAutoscaleLabel(isAutoMin, isAutoMax)}
        icon={FiZap}
        value={isAutoMin || isAutoMax}
        disabled={disabled}
        onChange={() => handleAutoscaleToggle()}
      />

      <DomainTooltip
        id={TOOLTIP_ID}
        open={tooltipOpen}
        domain={domain}
        dataDomain={dataDomain}
        isAutoMin={isAutoMin}
        isAutoMax={isAutoMax}
        onAutoscaleToggle={handleAutoscaleToggle}
      />
    </div>
  );
}

export default DomainSlider;
