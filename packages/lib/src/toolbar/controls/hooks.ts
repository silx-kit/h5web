import type {
  ElementProps,
  FloatingContext,
  UseFloatingReturn,
} from '@floating-ui/react';
import {
  autoUpdate,
  offset,
  shift,
  size,
  useFloating,
} from '@floating-ui/react';
import { useClickOutside, useKeyboardEvent, useToggle } from '@react-hookz/web';
import type { FocusEvent } from 'react';
import { useCallback, useMemo } from 'react';

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
