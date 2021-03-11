import { ReactElement, useEffect, useRef, useState } from 'react';
import styles from './DomainSlider.module.css';
import type {
  CustomDomain,
  Domain,
  ScaleType,
} from '../../../vis-packs/core/models';
import ToggleBtn from '../ToggleBtn';
import { FiEdit3 } from 'react-icons/fi';
import { useClickAway, useKey, useToggle } from 'react-use';
import DomainTooltip from './DomainTooltip';
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
  disabled?: boolean;
  onCustomDomainChange: (domain: CustomDomain) => void;
}

function DomainSlider(props: Props): ReactElement {
  const { dataDomain, customDomain, scaleType, disabled } = props;
  const { onCustomDomainChange } = props;

  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain, errors] = useSafeDomain(visDomain, dataDomain, scaleType);

  const [sliderDomain, setSliderDomain] = useState(visDomain);
  useEffect(() => {
    setSliderDomain(visDomain);
  }, [visDomain, setSliderDomain]);

  const isAutoMin = customDomain[0] === undefined;
  const isAutoMax = customDomain[1] === undefined;

  const [hovered, toggleHovered] = useToggle(false);
  const [isEditingMin, toggleEditingMin] = useToggle(false);
  const [isEditingMax, toggleEditingMax] = useToggle(false);
  const isEditing = isEditingMin || isEditingMax;

  function toggleEditing(force: boolean) {
    toggleEditingMin(force);
    toggleEditingMax(force);
  }

  const rootRef = useRef(null);
  useClickAway(rootRef, () => toggleEditing(false));
  useKey('Escape', () => {
    toggleEditing(false);
    toggleHovered(false);
  });

  return (
    <div
      ref={rootRef}
      className={styles.root}
      aria-expanded={hovered}
      aria-describedby={TOOLTIP_ID}
      onPointerEnter={() => toggleHovered(true)}
      onPointerLeave={() => toggleHovered(false)}
    >
      <ScaledSlider
        value={sliderDomain}
        safeVisDomain={safeDomain}
        dataDomain={dataDomain}
        scaleType={scaleType}
        errors={errors}
        disabled={disabled}
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
        icon={FiEdit3}
        value={isEditing}
        disabled={disabled}
        onChange={() => toggleEditing(!isEditing)}
      />

      <DomainTooltip
        id={TOOLTIP_ID}
        open={hovered || isEditing}
        sliderDomain={sliderDomain}
        dataDomain={dataDomain}
        errors={errors}
        isAutoMin={isAutoMin}
        isAutoMax={isAutoMax}
        onAutoMinToggle={() => {
          const newMin = isAutoMin ? dataDomain[0] : undefined;
          onCustomDomainChange([newMin, customDomain[1]]);

          if (!isAutoMin) {
            toggleEditingMin(false);
          }
        }}
        onAutoMaxToggle={() => {
          const newMax = isAutoMax ? dataDomain[1] : undefined;
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
      />
    </div>
  );
}

export default DomainSlider;
