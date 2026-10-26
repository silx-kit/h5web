import {
  autoUpdate,
  type ElementProps,
  type FloatingContext,
  offset,
  shift,
  size,
  useFloating,
  type UseFloatingReturn,
} from '@floating-ui/react';
import { assertNonNull } from '@h5web/shared/guards';
import { type Domain } from '@h5web/shared/vis-models';
import { useClickOutside, useKeyboardEvent, useToggle } from '@react-hookz/web';
import {
  type DOMAttributes,
  type FocusEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { flushSync } from 'react-dom';

export const POPOVER_CLEARANCE = 6;

const MENU_MAX_HEIGHT = 320; // 20rem

export function useFloatingMenu(): UseFloatingReturn<HTMLButtonElement> {
  const [isOpen, toggle] = useToggle();

  return useFloating<HTMLButtonElement>({
    open: isOpen,
    middleware: [
      offset(POPOVER_CLEARANCE),
      size({
        padding: POPOVER_CLEARANCE * 2,
        apply({ availableHeight, elements, rects }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(availableHeight, MENU_MAX_HEIGHT)}px`,
            minWidth: `${rects.reference.width}px`,
          });
        },
      }),
      shift({ padding: POPOVER_CLEARANCE }),
    ],
    onOpenChange: toggle,
    whileElementsMounted: autoUpdate,
  });
}

/* Custom dismiss interaction hook for Floating UI widgets.
 * Reduces bundle size (~16 kB) by replacing:
 * - `useDismiss` (Escape key, click outside)
 * - `FloatingFocusManager` (focus out) */
export function useFloatingDismiss(context: FloatingContext): ElementProps {
  const { refs, onOpenChange } = context; // eslint-disable-line @typescript-eslint/unbound-method
  const { domReference, floating } = refs;

  const handleBlur = useCallback(
    (evt: FocusEvent) => {
      const { relatedTarget } = evt;
      if (
        relatedTarget &&
        !domReference.current?.contains(relatedTarget) &&
        !floating.current?.contains(relatedTarget)
      ) {
        onOpenChange(false);
      }
    },
    [domReference, floating, onOpenChange],
  );

  const referenceProps = useMemo(() => ({ onBlur: handleBlur }), [handleBlur]);
  const floatingProps = useMemo(() => ({ onBlur: handleBlur }), [handleBlur]);

  useKeyboardEvent('Escape', () => onOpenChange(false));
  useClickOutside(floating, (evt) => {
    const triggerRef = domReference.current;
    if (evt.target instanceof Element && triggerRef?.contains(evt.target)) {
      return; // skip
    }
    onOpenChange(false);
  });

  return useMemo(
    () => ({ reference: referenceProps, floating: floatingProps }),
    [referenceProps, floatingProps],
  );
}

/* Pointer interactions for sliders: press track or thumb, then drag with pointer capture.
 * Handlers receive integer value at pointer position (grabbed thumbs don't jump). */
export function useSliderDrag(
  vertical: boolean,
  [min, max]: Domain,
  getThumbIndex: (val: number, pressedIndex: number) => number | undefined, // `pressedIndex` is -1 when pressing track
  onDrag: (val: number, index: number) => void,
  onDragEnd?: () => void,
): {
  trackRef: RefObject<HTMLDivElement | null>;
  dragProps: DOMAttributes<HTMLElement>;
} {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    index: number;
    delta: number; // delta between pointer and thumb centre
  }>(undefined);

  function getValue(evt: PointerEvent, delta: number): number {
    assertNonNull(trackRef.current);
    const { left, bottom, width, height } =
      trackRef.current.getBoundingClientRect();

    const ratio = vertical
      ? (bottom - evt.clientY - delta) / height
      : (evt.clientX - left - delta) / width;
    return Math.round(min + Math.min(Math.max(ratio, 0), 1) * (max - min));
  }

  const dragProps: DOMAttributes<HTMLElement> = {
    onPointerDown: (evt) => {
      if (evt.button !== 0 || dragRef.current) {
        return;
      }

      assertNonNull(trackRef.current);
      const thumbs = [
        ...trackRef.current.querySelectorAll<HTMLElement>('[role="slider"]'),
      ];
      const pressedIndex = thumbs.findIndex((thumb) =>
        thumb.contains(evt.target as Node),
      );
      const rect =
        pressedIndex === -1
          ? undefined
          : thumbs[pressedIndex].getBoundingClientRect();
      const delta = !rect
        ? 0
        : vertical
          ? rect.top + rect.height / 2 - evt.clientY
          : evt.clientX - rect.left - rect.width / 2;

      const val = getValue(evt, delta);
      const index = getThumbIndex(val, pressedIndex);
      if (index !== undefined) {
        evt.preventDefault(); // prevent text selection
        thumbs[index].focus({ preventScroll: true });
        evt.currentTarget.setPointerCapture(evt.pointerId);
        dragRef.current = { pointerId: evt.pointerId, index, delta };
        onDrag(val, index);
      }
    },
    onPointerMove: (evt) => {
      if (dragRef.current?.pointerId === evt.pointerId) {
        const { index, delta } = dragRef.current;
        flushSync(() => onDrag(getValue(evt, delta), index)); // render before next move so handlers see latest value
      }
    },
    onLostPointerCapture: (evt) => {
      if (dragRef.current?.pointerId === evt.pointerId) {
        dragRef.current = undefined;
        onDragEnd?.();
      }
    },
  };

  return { trackRef, dragProps };
}
