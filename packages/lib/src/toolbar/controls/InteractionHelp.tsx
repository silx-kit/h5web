import { useClickOutside, useToggle } from '@react-hookz/web';
import { useRef } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

import type { InteractionInfo } from '../../interactions/models';
import overflowMenuStyles from '../OverflowMenu.module.css';
import styles from './InteractionHelp.module.css';
import ToggleBtn from './ToggleBtn';

interface Props {
  interactions: InteractionInfo[];
}

function InteractionHelp(props: Props) {
  const { interactions } = props;

  const [isHelpMenuOpen, toggleHelpMenu] = useToggle(false);
  const rootRef = useRef(null);

  useClickOutside(rootRef, () => {
    if (isHelpMenuOpen) {
      toggleHelpMenu(false);
    }
  });

  return (
    <div className={overflowMenuStyles.root} ref={rootRef}>
      <ToggleBtn
        icon={FiHelpCircle}
        iconOnly
        onToggle={toggleHelpMenu}
        label="Show help"
        value={isHelpMenuOpen}
      />
      <div className={overflowMenuStyles.menu} hidden={!isHelpMenuOpen}>
        <div className={overflowMenuStyles.menuList}>
          {interactions.map(({ shortcut, description }) => (
            <li key={shortcut} className={styles.entry}>
              <span>{description}</span>{' '}
              <kbd className={styles.shortcut}>{shortcut}</kbd>
            </li>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InteractionHelp;
