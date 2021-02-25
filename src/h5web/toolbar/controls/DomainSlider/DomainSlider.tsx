import type { ReactElement, Ref } from 'react';
import ReactSlider from 'react-slider';
import styles from './DomainSlider.module.css';
import type { CustomDomain, Domain } from '../../../vis-packs/core/models';
import { extendDomain } from '../../../vis-packs/core/utils';
import ToggleBtn from '../ToggleBtn';
import { FiSkipBack, FiSkipForward, FiZap } from 'react-icons/fi';
import { useKey, useToggle } from 'react-use';
import DomainTooltip from './DomainTooltip';
import Thumb from './Thumb';

const EXTEND_FACTOR = 0.2;
const NB_DECIMALS = 1;
const TOOLTIP_ID = 'domain-tooltip';

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
  customDomain: CustomDomain;
  disabled?: boolean;
  onCustomDomainChange: (domain: CustomDomain) => void;
}

function DomainSlider(props: Props): ReactElement {
  const { dataDomain, customDomain, disabled, onCustomDomainChange } = props;

  const [tooltipOpen, toggleTooltip] = useToggle(false);
  useKey('Escape', () => toggleTooltip(false));

  const [extendedMin, extendedMax] = extendDomain(dataDomain, EXTEND_FACTOR);
  const step = Math.max((extendedMax - extendedMin) / 100, 10 ** -NB_DECIMALS);

  const isAutoMin = customDomain[0] === undefined;
  const isAutoMax = customDomain[1] === undefined;
  const isAutoscaling = isAutoMin || isAutoMax;

  const appliedDomain: Domain = [
    customDomain[0] ?? dataDomain[0],
    customDomain[1] ?? dataDomain[1],
  ];

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
        value={appliedDomain}
        min={extendedMin}
        max={extendedMax}
        step={step}
        disabled={disabled}
        onAfterChange={(bounds) => onCustomDomainChange(bounds as Domain)}
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

      <ToggleBtn
        small
        label={getAutoscaleLabel(isAutoMin, isAutoMax)}
        icon={FiZap}
        value={isAutoscaling}
        disabled={disabled}
        onChange={() => {
          onCustomDomainChange(
            isAutoscaling ? dataDomain : [undefined, undefined]
          );
        }}
      />

      <DomainTooltip
        id={TOOLTIP_ID}
        open={tooltipOpen}
        domain={appliedDomain}
        dataDomain={dataDomain}
        isAutoMin={isAutoMin}
        isAutoMax={isAutoMax}
        onAutoMinToggle={() => {
          const newMin = isAutoMin ? dataDomain[0] : undefined;
          onCustomDomainChange([newMin, customDomain[1]]);
        }}
        onAutoMaxToggle={() => {
          const newMax = isAutoMax ? dataDomain[1] : undefined;
          onCustomDomainChange([customDomain[0], newMax]);
        }}
      />
    </div>
  );
}

export default DomainSlider;
