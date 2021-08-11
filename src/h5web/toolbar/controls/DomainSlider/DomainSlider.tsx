import { useEffect, useRef, useState } from 'react';
import styles from './DomainSlider.module.css';
import type {
  CustomDomain,
  Domain,
  HistogramParams,
  ScaleType,
} from '../../../vis-packs/core/models';
import ToggleBtn from '../ToggleBtn';
import { FiEdit3 } from 'react-icons/fi';
import { useKey } from 'react-use';
import { useClickOutside, useToggle } from '@react-hookz/web';
import DomainTooltip, { DomainTooltipHandle } from './DomainTooltip';
import ScaledSlider from './ScaledSlider';
import {
  useSafeDomain,
  useVisDomain,
} from '../../../vis-packs/core/heatmap/hooks';

const TOOLTIP_ID = 'domain-tooltip';

interface Props {
  dataDomain: Domain;
  customDomain: CustomDomain;
  scaleType: ScaleType;
  onCustomDomainChange: (domain: CustomDomain) => void;
  histogram?: HistogramParams;
}

function DomainSlider(props: Props) {
  const { dataDomain, customDomain, scaleType } = props;
  const { onCustomDomainChange, histogram } = props;

  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain, errors] = useSafeDomain(visDomain, dataDomain, scaleType);

  const [sliderDomain, setSliderDomain] = useState(visDomain);
  useEffect(() => {
    setSliderDomain(visDomain);
  }, [visDomain, setSliderDomain]);

  const isAutoMin = customDomain[0] === null;
  const isAutoMax = customDomain[1] === null;

  const [hovered, toggleHovered] = useToggle(false);
  const [isEditingMin, toggleEditingMin] = useToggle(false);
  const [isEditingMax, toggleEditingMax] = useToggle(false);
  const isEditing = isEditingMin || isEditingMax;

  function toggleEditing(force: boolean) {
    toggleEditingMin(force);
    toggleEditingMax(force);
  }

  function cancelEditing() {
    if (isEditing) {
      toggleEditing(false);
      tooltipRef.current?.cancelEditing();
    }
  }

  const rootRef = useRef(null);
  const tooltipRef = useRef<DomainTooltipHandle>(null);

  useClickOutside(rootRef, cancelEditing);
  useKey('Escape', () => {
    toggleHovered(false);
    cancelEditing();
  });

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onPointerEnter={() => toggleHovered(true)}
      onPointerLeave={() => toggleHovered(false)}
    >
      <ScaledSlider
        value={sliderDomain}
        safeVisDomain={safeDomain}
        dataDomain={dataDomain}
        scaleType={scaleType}
        errors={errors}
        isAutoMin={isAutoMin}
        isAutoMax={isAutoMax}
        onChange={(newValue) => {
          setSliderDomain(newValue);
          toggleEditing(false);
        }}
        onAfterChange={(hasMinChanged, hasMaxChanged) => {
          onCustomDomainChange([
            hasMinChanged ? sliderDomain[0] : customDomain[0],
            hasMaxChanged ? sliderDomain[1] : customDomain[1],
          ]);
        }}
      />

      <ToggleBtn
        iconOnly
        small
        label="Edit domain"
        aria-expanded={hovered || isEditing}
        aria-controls={TOOLTIP_ID}
        icon={FiEdit3}
        value={isEditing}
        onToggle={() => toggleEditing(!isEditing)}
      />

      <DomainTooltip
        ref={tooltipRef}
        id={TOOLTIP_ID}
        open={hovered || isEditing}
        sliderDomain={sliderDomain}
        dataDomain={dataDomain}
        errors={errors}
        isAutoMin={isAutoMin}
        isAutoMax={isAutoMax}
        onAutoMinToggle={() => {
          const newMin = isAutoMin ? dataDomain[0] : null;
          onCustomDomainChange([newMin, customDomain[1]]);
          if (!isAutoMin) {
            toggleEditingMin(false);
          }
        }}
        onAutoMaxToggle={() => {
          const newMax = isAutoMax ? dataDomain[1] : null;
          onCustomDomainChange([customDomain[0], newMax]);
          if (!isAutoMax) {
            toggleEditingMax(false);
          }
        }}
        isEditingMin={isEditingMin}
        isEditingMax={isEditingMax}
        onEditMin={toggleEditingMin}
        onEditMax={toggleEditingMax}
        onChangeMin={(val) => onCustomDomainChange([val, customDomain[1]])}
        onChangeMax={(val) => onCustomDomainChange([customDomain[0], val])}
        onSwap={() => onCustomDomainChange([customDomain[1], customDomain[0]])}
        scaleType={scaleType}
        histogram={histogram}
      />
    </div>
  );
}

export type { Props as DomainSliderProps };
export default DomainSlider;
