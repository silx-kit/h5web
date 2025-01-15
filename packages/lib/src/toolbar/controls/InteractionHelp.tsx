import {
  autoUpdate,
  offset,
  shift,
  useClick,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { useToggle } from '@react-hookz/web';
import { useId } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

import { type InteractionInfo } from '../../interactions/models';
import toolbarStyles from '../Toolbar.module.css';
import Btn from './Btn';
import { POPOVER_CLEARANCE, useFloatingDismiss } from './hooks';
import styles from './InteractionHelp.module.css';

interface Props {
  interactions: InteractionInfo[];
}

function InteractionHelp(props: Props) {
  const { interactions } = props;

  const [isOpen, toggle] = useToggle();
  const referenceId = useId();

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    open: isOpen,
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

  return (
    <>
      <Btn
        ref={refs.setReference}
        id={referenceId}
        label="Show help"
        icon={FiHelpCircle}
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
          className={toolbarStyles.popup}
          style={floatingStyles}
          role="dialog"
          aria-labelledby={referenceId}
          {...getFloatingProps()}
        >
          <ul className={styles.list}>
            {interactions.map(({ shortcut, description }) => (
              <li key={shortcut} className={styles.entry}>
                <span>{description}</span>{' '}
                <kbd className={styles.shortcut}>{shortcut}</kbd>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default InteractionHelp;
