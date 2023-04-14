import { useClickOutside, useToggle } from '@react-hookz/web';
import { useRef } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

import { type InteractionInfo } from '../../interactions/models';
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
    <div className={styles.root} ref={rootRef}>
      <ToggleBtn
        icon={FiHelpCircle}
        iconOnly
        onToggle={toggleHelpMenu}
        label="Show help"
        value={isHelpMenuOpen}
      />
      <div className={styles.menu} hidden={!isHelpMenuOpen}>
        <div className={styles.menuList}>
          {interactions.map(({ shortcut, description }) => (
            <li key={shortcut}>
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
