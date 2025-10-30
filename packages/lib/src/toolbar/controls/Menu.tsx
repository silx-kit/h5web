import { useClick, useInteractions } from '@floating-ui/react';
import { type ComponentType, type PropsWithChildren, useId } from 'react';

import Btn from './Btn';
import { useFloatingDismiss, useFloatingMenu } from './hooks';
import styles from './Menu.module.css';

interface Props {
  label: string;
  Icon?: ComponentType<{ className: string }>;
}

function Menu(props: PropsWithChildren<Props>) {
  const { label, Icon, children } = props;

  const { context, refs, floatingStyles } = useFloatingMenu();
  const { floatingId, open: isOpen } = context;

  const referenceId = useId();

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useFloatingDismiss(context),
  ]);

  return (
    <>
      <Btn
        ref={refs.setReference}
        id={referenceId}
        label={label}
        Icon={Icon}
        withArrow
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={(isOpen && floatingId) || undefined}
        {...getReferenceProps()}
      />

      {isOpen && (
        <div
          ref={refs.setFloating}
          id={floatingId}
          className={styles.menu}
          style={floatingStyles}
          role="menu"
          aria-labelledby={referenceId}
          {...getFloatingProps()}
        >
          {children}
        </div>
      )}
    </>
  );
}

export default Menu;
