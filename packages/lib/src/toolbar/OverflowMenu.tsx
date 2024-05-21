import {
  autoUpdate,
  offset,
  shift,
  useClick,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { useToggle } from '@react-hookz/web';
import type { PropsWithChildren } from 'react';
import { cloneElement, isValidElement, useId } from 'react';
import { FiMenu } from 'react-icons/fi';
import flattenChildren from 'react-keyed-flatten-children';

import { useFloatingDismiss } from './controls/hooks';
import styles from './OverflowMenu.module.css';
import Separator from './Separator';
import toolbarStyles from './Toolbar.module.css';

interface Props {}

function OverflowMenu(props: PropsWithChildren<Props>) {
  const { children } = props;
  const validChildren = flattenChildren(children).filter(isValidElement);

  const [isOpen, toggle] = useToggle();
  const referenceId = useId();

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    open: isOpen,
    placement: 'bottom-end',
    middleware: [offset(6), shift({ padding: 6 })],
    onOpenChange: toggle,
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useFloatingDismiss(context),
  ]);

  if (validChildren.length === 0) {
    return null;
  }

  return (
    <>
      <Separator />

      <button
        ref={refs.setReference}
        id={referenceId}
        className={toolbarStyles.btn}
        type="button"
        aria-label="More controls"
        aria-haspopup="dialog"
        aria-expanded={isOpen || undefined}
        aria-controls={(isOpen && context.floatingId) || undefined}
        {...getReferenceProps()}
      >
        <span className={toolbarStyles.btnLike}>
          <FiMenu className={toolbarStyles.icon} />
        </span>
      </button>

      {isOpen && (
        <div
          ref={refs.setFloating}
          id={context.floatingId}
          className={styles.popup}
          style={{
            ...floatingStyles,
            overflow: 'visible', // don't clip nested floating elements
          }}
          role="dialog"
          aria-labelledby={referenceId}
          {...getFloatingProps()}
        >
          {validChildren.map((child) => (
            // Render cloned child (React elements don't like to be moved around)
            <div className={styles.control} key={child.key}>
              {cloneElement(child)}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default OverflowMenu;
