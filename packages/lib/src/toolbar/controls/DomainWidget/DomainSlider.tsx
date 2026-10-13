import { type ColorScaleType, type Domain } from '@h5web/shared/vis-models';
import { Root as SliderRoot } from '@radix-ui/react-slider';
import { type KeyboardEvent, useRef } from 'react';
import { FiSkipBack, FiSkipForward } from 'react-icons/fi';

import { getSafeDomain } from '../../../vis/heatmap/utils';
import { useCombinedDomain } from '../../../vis/hooks';
import { type DomainErrors } from '../../../vis/models';
import { clampBound, createScale, extendDomain } from '../../../vis/utils';
import styles from './DomainSlider.module.css';
import Thumb from './Thumb';
import Track from './Track';

const SLIDER_RANGE: Domain = [1, 100];
const EXTEND_FACTOR = 0.3;
const SLIDER_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
]);

interface Interaction {
  thumbIndex: number; // thumb being moved
  isKeyboard: boolean;
  pressedKeys: Set<string>;
  scaledValueBefore: Domain;
  valueBefore: Domain;
  hasMoved: boolean;
}

interface Props {
  value: Domain;
  dataDomain: Domain;
  safeVisDomain: Domain;
  scaleType: ColorScaleType;
  errors: DomainErrors;
  isAutoMin: boolean;
  isAutoMax: boolean;
  disabled?: boolean;
  onChange: (newValue: Domain) => void;
  onAfterChange: (hasMinChanged: boolean, hasMaxChanged: boolean) => void;
}

function DomainSlider(props: Props) {
  const {
    value,
    dataDomain,
    safeVisDomain,
    scaleType,
    errors,
    isAutoMin,
    isAutoMax,
    disabled = false,
  } = props;
  const { onChange, onAfterChange: onDone } = props;
  const { minGreater, minError, maxError } = errors;

  const sliderDomain = useCombinedDomain([safeVisDomain, dataDomain]);
  const sliderExtent = extendDomain(sliderDomain, EXTEND_FACTOR, scaleType);
  const scale = createScale(scaleType, {
    domain: sliderExtent.map((val) => clampBound(val)),
    range: SLIDER_RANGE,
    clamp: true,
  });

  const [safeValue] = getSafeDomain(value, dataDomain, scaleType);
  const scaledValue = safeValue.map(scale).map(Math.round) as Domain;

  const rootRef = useRef<HTMLSpanElement>(null);
  const interactionRef = useRef<Interaction>();

  function getThumbs(): HTMLElement[] {
    const root = rootRef.current;
    return root
      ? [...root.querySelectorAll<HTMLElement>('[role="slider"]')]
      : [];
  }

  function endInteraction() {
    const interaction = interactionRef.current;
    interactionRef.current = undefined;

    if (interaction?.hasMoved) {
      const [scaledMinBefore, scaledMaxBefore] = interaction.scaledValueBefore;
      onDone(
        scaledValue[0] !== scaledMinBefore,
        scaledValue[1] !== scaledMaxBefore,
      );
    }
  }

  function startInteraction(thumbIndex: number, isKeyboard: boolean) {
    endInteraction(); // in case previous interaction didn't end properly

    const interaction: Interaction = {
      thumbIndex,
      isKeyboard,
      pressedKeys: new Set(),
      scaledValueBefore: scaledValue,
      valueBefore: value,
      hasMoved: false,
    };

    interactionRef.current = interaction;
    return interaction;
  }

  function handleChange(newBound: number) {
    const interaction = interactionRef.current ?? startInteraction(0, false);
    const { thumbIndex, scaledValueBefore, valueBefore } = interaction;

    // Move active thumb and let it push the other thumb if needed ("pearling")
    const [scaledMin, scaledMax] = scaledValue;
    const [newScaledMin, newScaledMax] =
      thumbIndex === 0
        ? [newBound, Math.max(scaledMax, newBound)]
        : [Math.min(scaledMin, newBound), newBound];

    if (newScaledMin === scaledMin && newScaledMax === scaledMax) {
      return;
    }

    interaction.hasMoved = true;
    onChange([
      // Restore initial bound if thumb is back to its initial position
      newScaledMin === scaledValueBefore[0]
        ? valueBefore[0]
        : scale.invert(newScaledMin),
      newScaledMax === scaledValueBefore[1]
        ? valueBefore[1]
        : scale.invert(newScaledMax),
    ]);
  }

  function handleThumbKeyDown(evt: KeyboardEvent, thumbIndex: number) {
    if (!SLIDER_KEYS.has(evt.key)) {
      return;
    }

    const { current } = interactionRef;
    const interaction =
      current?.isKeyboard && current.thumbIndex === thumbIndex
        ? current
        : startInteraction(thumbIndex, true);

    interaction.pressedKeys.add(evt.key);

    // Radix always moves the first/last thumb on Home/End
    if (evt.key === 'Home' || evt.key === 'End') {
      evt.preventDefault(); // prevent Radix from handling the key
      handleChange(SLIDER_RANGE[evt.key === 'Home' ? 0 : 1]);
    }
  }

  return (
    <SliderRoot
      ref={rootRef}
      className={styles.slider}
      min={SLIDER_RANGE[0]}
      max={SLIDER_RANGE[1]}
      value={scaledValue}
      disabled={disabled}
      onPointerDown={(evt) => {
        // Find thumb that Radix is about to move: pressed thumb or thumb closest to pointer
        const distances = getThumbs().map((thumb) => {
          if (thumb.contains(evt.target as Node)) {
            return -1;
          }

          const { left, width } = thumb.getBoundingClientRect();
          return Math.abs(evt.clientX - (left + width / 2));
        });

        startInteraction(distances.indexOf(Math.min(...distances)), false);
      }}
      onLostPointerCapture={() => {
        // Pointer released, or interaction interrupted (e.g. by browser panning)
        if (!interactionRef.current?.isKeyboard) {
          endInteraction();
        }
      }}
      onKeyUp={(evt) => {
        const interaction = interactionRef.current;
        if (!interaction?.isKeyboard) {
          return;
        }

        // End interaction once all slider keys are released
        interaction.pressedKeys.delete(evt.key);
        if (interaction.pressedKeys.size === 0) {
          endInteraction();
        }
      }}
      onBlur={(evt) => {
        // End interaction when focus leaves slider (including when window loses focus)
        if (!evt.currentTarget.contains(evt.relatedTarget)) {
          endInteraction();
        }
      }}
      onValueChange={(newValues) => {
        // Radix sorts the values, so the thumbs swap when one is moved past the other:
        // find the new value of the active thumb
        const [first, second] = newValues;
        handleChange(scaledValue.includes(first) ? second : first);

        // When thumbs swap, Radix moves the focus to the other thumb; move it back
        const thumb = getThumbs().at(interactionRef.current?.thumbIndex ?? 0);
        if (thumb && thumb !== document.activeElement) {
          thumb.focus({ preventScroll: true });
        }
      }}
    >
      <Track scale={scale} dataDomain={dataDomain} />
      {(['min', 'max'] as const).map((bound, index) => (
        <Thumb
          key={bound}
          bound={bound}
          ratio={
            (scaledValue[index] - SLIDER_RANGE[0]) /
            (SLIDER_RANGE[1] - SLIDER_RANGE[0])
          }
          isAuto={index === 0 ? isAutoMin : isAutoMax}
          hasError={minGreater || (index === 0 ? !!minError : !!maxError)}
          disabled={disabled}
          AutoIcon={index === 0 ? FiSkipBack : FiSkipForward}
          onKeyDown={(evt) => handleThumbKeyDown(evt, index)}
        />
      ))}
    </SliderRoot>
  );
}

export type { Props as DomainSliderProps };
export default DomainSlider;
