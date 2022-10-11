import { useKeyboardEvent } from '@react-hookz/web';
import type { RefObject } from 'react';
import { useCallback } from 'react';

export function useKeyboardSupport(ref: RefObject<HTMLDivElement>) {
  const focusNext = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const { activeElement } = document;

    if (
      !(activeElement instanceof HTMLButtonElement) ||
      !ref.current.contains(activeElement)
    ) {
      return;
    }
    const buttonList = [...ref.current.querySelectorAll('button')];
    const activeIndex = buttonList.indexOf(activeElement);

    if (activeIndex >= 0 && activeIndex < buttonList.length - 1) {
      buttonList[activeIndex + 1].focus();
    }
  }, [ref]);

  const focusPrevious = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const { activeElement } = document;
    if (
      !(activeElement instanceof HTMLButtonElement) ||
      !ref.current.contains(activeElement)
    ) {
      return;
    }
    const buttonList = [...ref.current.querySelectorAll('button')];
    const activeIndex = buttonList.indexOf(activeElement);

    if (activeIndex > 0) {
      buttonList[activeIndex - 1].focus();
    }
  }, [ref]);

  useKeyboardEvent('ArrowUp', focusPrevious, [], { target: ref });
  useKeyboardEvent('ArrowDown', focusNext, [], { target: ref });
}
