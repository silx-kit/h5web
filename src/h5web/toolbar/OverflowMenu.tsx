import React, { ReactElement, useRef, Children, cloneElement } from 'react';
import { FiMenu } from 'react-icons/fi';
import { useToggle, useClickAway } from 'react-use';
import Separator from './Separator';
import styles from './OverflowMenu.module.css';

interface Props {
  children: ReactElement[];
}

function OverflowMenu(props: Props): ReactElement {
  const { children } = props;

  const overflowMenuRef = useRef(null);
  const [isOverflowMenuOpen, toggleOverflowMenu] = useToggle(false);

  useClickAway(
    overflowMenuRef,
    () => {
      if (isOverflowMenuOpen) {
        toggleOverflowMenu(false); // force close in case menu button was clicked
      }
    },
    ['click']
  );

  if (children.length === 0) {
    return <></>;
  }

  return (
    <div className={styles.root}>
      <Separator />

      <button
        className={styles.btn}
        type="button"
        aria-label="More controls"
        aria-haspopup="menu"
        aria-controls="more-menu"
        aria-expanded={isOverflowMenuOpen}
        onClick={toggleOverflowMenu}
      >
        <span className={styles.btnLike}>
          <FiMenu className={styles.icon} />
        </span>
      </button>

      <ul
        id="more-menu"
        className={styles.menu}
        ref={overflowMenuRef}
        role="menu"
        hidden={!isOverflowMenuOpen}
      >
        {Children.map(children, (child) => (
          // Render cloned child (React elements don't like to be moved around)
          <li role="menuitem">{cloneElement(child)}</li>
        ))}
      </ul>
    </div>
  );
}

export default OverflowMenu;
