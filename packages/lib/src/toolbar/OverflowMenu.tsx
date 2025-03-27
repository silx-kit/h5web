import {
  autoUpdate,
  offset,
  shift,
  useClick,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { useToggle } from '@react-hookz/web';
import {
  cloneElement,
  isValidElement,
  type PropsWithChildren,
  useId,
} from 'react';
import { FiMenu } from 'react-icons/fi';
import flattenChildren from 'react-keyed-flatten-children';

import Btn from './controls/Btn';
import { POPOVER_CLEARANCE, useFloatingDismiss } from './controls/hooks';
import styles from './OverflowMenu.module.css';
import Separator from './Separator';

interface Props {}

function OverflowMenu(props: PropsWithChildren<Props>) {
  const { children } = props;
  const validChildren = flattenChildren(children).filter(isValidElement);

  const [isOpen, toggle] = useToggle();
  const referenceId = useId();

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    open: isOpen,
    placement: 'bottom-end',
    middleware: [
      offset(POPOVER_CLEARANCE),
      shift({ padding: POPOVER_CLEARANCE }),
    ],
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

      <Btn
        ref={refs.setReference}
        id={referenceId}
        label="More controls"
        Icon={FiMenu}
        iconOnly
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={(isOpen && context.floatingId) || undefined}
        {...getReferenceProps()}
      />

      {isOpen && (
        <div
          ref={refs.setFloating}
          id={context.floatingId}
          className={styles.popup}
          style={floatingStyles}
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
