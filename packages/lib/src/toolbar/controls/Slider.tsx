import {
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
  type RefCallback,
  useRef,
} from 'react';

const KEY_STEPS: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
  PageDown: -10,
  PageUp: 10,
  Home: -Infinity,
  End: Infinity,
};

type ThumbProps = HTMLAttributes<HTMLElement> & {
  ref: RefCallback<HTMLElement>;
  style: CSSProperties;
};

interface Props<T extends number[]> {
  className: string;
  trackClassName: string;
  value: T; // one value per thumb, in ascending order
  min: number;
  max: number;
  vertical?: boolean;
  disabled?: boolean;
  children?: ReactNode; // rendered inside track element, behind thumbs
  renderThumb: (index: number, thumbProps: ThumbProps) => ReactNode;
  onBeforeChange?: (value: T) => void;
  onChange: (newValue: T) => void;
  onAfterChange?: (newValue: T) => void;
}

function Slider<T extends number[]>(props: Props<T>) {
  const { className, trackClassName, value, min, max } = props;
  const { vertical = false, disabled = false, children, renderThumb } = props;
  const { onBeforeChange, onChange, onAfterChange } = props;

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLElement | null)[]>([]);
  const dragRef = useRef<{ index: number; offset: number }>(); // offset between pointer and thumb centre
  const startValueRef = useRef<T>(); // value at start of current interaction

  const valueRef = useRef(value); // latest value, even if not yet rendered
  valueRef.current = value;

  function startChange() {
    if (!startValueRef.current) {
      startValueRef.current = valueRef.current;
      onBeforeChange?.(valueRef.current);
    }
  }

  // Move thumb to new value and let it push the other thumbs if needed
  function moveThumb(index: number, newVal: number) {
    const val = Math.min(Math.max(Math.round(newVal), min), max);
    const oldValue = valueRef.current;
    const newValue = oldValue.map((v, i) =>
      i < index ? Math.min(v, val) : i > index ? Math.max(v, val) : val,
    ) as T;

    if (newValue.some((v, i) => v !== oldValue[i])) {
      valueRef.current = newValue;
      onChange(newValue);
    }
  }

  function endChange() {
    const startValue = startValueRef.current;
    startValueRef.current = undefined;

    const newValue = valueRef.current;
    if (!disabled && startValue?.some((v, i) => v !== newValue[i])) {
      onAfterChange?.(newValue);
    }
  }

  function getPointerValue(evt: PointerEvent, offset = 0): number {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) {
      return min;
    }

    const ratio = vertical
      ? (rect.bottom - evt.clientY - offset) / rect.height
      : (evt.clientX - offset - rect.left) / rect.width;
    return min + ratio * (max - min);
  }

  return (
    <div
      className={className}
      onPointerDown={(evt) => {
        if (disabled || evt.button !== 0) {
          return;
        }

        const thumbs = thumbRefs.current;
        const pressedIndex = thumbs.findIndex((t) =>
          t?.contains(evt.target as Node),
        );
        const pointerVal = getPointerValue(evt);

        // Pick pressed thumb, or else thumb closest to pointer (last one if overlapping thumbs are before pointer)
        const distances = value.map((v) => Math.abs(v - pointerVal));
        const closest = distances.indexOf(Math.min(...distances));
        const index =
          pressedIndex !== -1
            ? pressedIndex
            : pointerVal > value[closest]
              ? distances.lastIndexOf(distances[closest])
              : closest;

        const thumb = thumbs[index];
        if (!thumb) {
          return;
        }

        const { left, top, width, height } = thumb.getBoundingClientRect();
        const offset =
          pressedIndex === -1
            ? 0
            : vertical
              ? top + height / 2 - evt.clientY
              : evt.clientX - left - width / 2;

        evt.preventDefault(); // prevent text selection
        thumb.focus({ preventScroll: true });
        evt.currentTarget.setPointerCapture(evt.pointerId);
        dragRef.current = { index, offset };
        startChange();

        if (pressedIndex === -1) {
          moveThumb(index, pointerVal);
        }
      }}
      onPointerMove={(evt) => {
        if (dragRef.current && !disabled) {
          const { index, offset } = dragRef.current;
          moveThumb(index, getPointerValue(evt, offset));
        }
      }}
      onLostPointerCapture={() => {
        dragRef.current = undefined;
        endChange();
      }}
    >
      <div ref={trackRef} className={trackClassName}>
        {children}
        {value.map((val, index) => {
          const pos = `${((val - min) / (max - min)) * 100}%`;
          return renderThumb(index, {
            ref: (elem) => {
              thumbRefs.current[index] = elem;
            },
            role: 'slider',
            tabIndex: disabled ? -1 : 0,
            'aria-valuemin': min,
            'aria-valuemax': max,
            'aria-valuenow': val,
            'aria-orientation': vertical ? 'vertical' : 'horizontal',
            'aria-disabled': disabled || undefined,
            style: {
              position: 'absolute',
              ...(vertical
                ? { bottom: pos, left: '50%', translate: '-50% 50%' }
                : { left: pos, top: '50%', translate: '-50% -50%' }),
            },
            onKeyDown: (evt) => {
              const step = KEY_STEPS[evt.key];
              if (step !== undefined && !disabled) {
                evt.preventDefault();
                startChange();
                moveThumb(index, valueRef.current[index] + step);
              }
            },
            onKeyUp: (evt) => {
              if (KEY_STEPS[evt.key] !== undefined) {
                endChange();
              }
            },
            onBlur: endChange,
          });
        })}
      </div>
    </div>
  );
}

export type { ThumbProps };
export default Slider;
