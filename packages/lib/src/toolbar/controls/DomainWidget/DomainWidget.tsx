import type { ColorScaleType, Domain } from '@h5web/shared/vis-models';
import { useClickOutside, useKeyboardEvent, useToggle } from '@react-hookz/web';
import { useEffect, useRef, useState } from 'react';
import { FiEdit3 } from 'react-icons/fi';

import { useSafeDomain, useVisDomain } from '../../../vis/heatmap/hooks';
import type { CustomDomain, HistogramParams } from '../../../vis/models';
import Histogram from '../Histogram/Histogram';
import ToggleBtn from '../ToggleBtn';
import type { DomainControlsHandle } from './DomainControls';
import DomainControls from './DomainControls';
import DomainSlider from './DomainSlider';
import styles from './DomainWidget.module.css';

const POPUP_ID = 'h5w-domain-popup';

interface Props {
  dataDomain: Domain;
  customDomain: CustomDomain;
  scaleType: ColorScaleType;
  histogram?: HistogramParams;
  disabled?: boolean;
  onCustomDomainChange: (domain: CustomDomain) => void;
}

function DomainWidget(props: Props) {
  const { dataDomain, customDomain, scaleType, disabled = false } = props;
  const { onCustomDomainChange, histogram } = props;

  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain, errors] = useSafeDomain(visDomain, dataDomain, scaleType);

  const [sliderDomain, setSliderDomain] = useState(visDomain);
  useEffect(() => {
    setSliderDomain(visDomain);
  }, [visDomain]);

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
      popupRef.current?.cancelEditing();
    }
  }

  const rootRef = useRef(null);
  const popupRef = useRef<DomainControlsHandle>(null);

  useClickOutside(rootRef, cancelEditing);
  useKeyboardEvent('Escape', () => {
    toggleHovered(false);
    cancelEditing();
  });

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-disabled={disabled || undefined}
      onPointerEnter={() => toggleHovered(true)}
      onPointerLeave={() => toggleHovered(false)}
    >
      <div className={styles.sliderContainer}>
        <DomainSlider
          value={sliderDomain}
          safeVisDomain={safeDomain}
          dataDomain={dataDomain}
          scaleType={scaleType}
          errors={errors}
          isAutoMin={isAutoMin}
          isAutoMax={isAutoMax}
          disabled={disabled}
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
          aria-controls={POPUP_ID}
          icon={FiEdit3}
          value={isEditing}
          disabled={disabled}
          onToggle={() => toggleEditing(!isEditing)}
        />
      </div>

      <div
        id={POPUP_ID}
        className={styles.popupOuter}
        role="dialog"
        aria-label="Edit domain"
        hidden={!hovered && !isEditing}
      >
        <div className={styles.popup}>
          {histogram && (
            <Histogram
              dataDomain={dataDomain}
              value={sliderDomain}
              scaleType={scaleType}
              onChangeMin={(val) =>
                onCustomDomainChange([val, customDomain[1]])
              }
              onChangeMax={(val) =>
                onCustomDomainChange([customDomain[0], val])
              }
              {...histogram}
            />
          )}
          <DomainControls
            ref={popupRef}
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
            onSwap={() =>
              onCustomDomainChange([customDomain[1], customDomain[0]])
            }
          />
        </div>
      </div>
    </div>
  );
}

export type { Props as DomainWidgetProps };
export default DomainWidget;
