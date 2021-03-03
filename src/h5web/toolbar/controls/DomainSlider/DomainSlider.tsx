import { ReactElement, useEffect, useState } from 'react';
import styles from './DomainSlider.module.css';
import type { CustomDomain, Domain } from '../../../vis-packs/core/models';
import ToggleBtn from '../ToggleBtn';
import { FiZap } from 'react-icons/fi';
import { useKey, useToggle } from 'react-use';
import DomainTooltip from './DomainTooltip';
import ScaledSlider from './ScaledSlider';
import { useVisDomain } from './hooks';

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

  const visDomain = useVisDomain(dataDomain, customDomain);
  const [sliderDomain, setSliderDomain] = useState(visDomain);

  useEffect(() => {
    setSliderDomain(visDomain);
  }, [visDomain, setSliderDomain]);

  const isAutoMin = customDomain[0] === undefined;
  const isAutoMax = customDomain[1] === undefined;
  const isAutoscaling = isAutoMin || isAutoMax;

  const [tooltipOpen, toggleTooltip] = useToggle(false);
  useKey('Escape', () => toggleTooltip(false));

  return (
    <div
      className={styles.root}
      aria-expanded={tooltipOpen}
      aria-describedby={TOOLTIP_ID}
      onPointerEnter={() => toggleTooltip(true)}
      onPointerLeave={() => toggleTooltip(false)}
    >
      <ScaledSlider
        value={sliderDomain}
        dataDomain={dataDomain}
        isAutoMin={isAutoMin}
        isAutoMax={isAutoMax}
        disabled={disabled}
        onChange={setSliderDomain}
        onAfterChange={(hasMinChanged, hasMaxChanged) => {
          onCustomDomainChange([
            hasMinChanged ? sliderDomain[0] : customDomain[0],
            hasMaxChanged ? sliderDomain[1] : customDomain[1],
          ]);
        }}
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
        domain={sliderDomain}
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
