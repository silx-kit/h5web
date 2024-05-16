import type { ElementProps, FloatingContext } from '@floating-ui/react';
import { useClickOutside, useKeyboardEvent } from '@react-hookz/web';
import type { FocusEvent } from 'react';
import { useCallback, useMemo } from 'react';

/* Custom dismiss interaction hook for Floating UI widgets.
 * Reduces bundle size (~16 kB) by replacing:
 * - `useDismiss` (Escape key, click outside)
 * - `FloatingFocusManager` (focus out) */
export function useFloatingDismiss(context: FloatingContext): ElementProps {
  const { refs, onOpenChange } = context;
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
  useClickOutside(refs.floating, (evt) => {
    const triggerRef = refs.domReference.current;
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
