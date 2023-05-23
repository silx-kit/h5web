import { useClickOutside, useToggle } from '@react-hookz/web';
import type { PropsWithChildren } from 'react';
import { cloneElement, isValidElement, useRef } from 'react';
import { FiMenu } from 'react-icons/fi';
import flattenChildren from 'react-keyed-flatten-children';

import styles from './OverflowMenu.module.css';
import Separator from './Separator';

interface Props {}

function OverflowMenu(props: PropsWithChildren<Props>) {
  const { children } = props;
  const validChildren = flattenChildren(children).filter(isValidElement);

  const rootRef = useRef(null);
  const [isOverflowMenuOpen, toggleOverflowMenu] = useToggle(false);

  useClickOutside(rootRef, () => {
    if (isOverflowMenuOpen) {
      toggleOverflowMenu(false);
    }
  });

  if (validChildren.length === 0) {
    return null;
  }

  return (
    <>
      <Separator />
      <div ref={rootRef} className={styles.root}>
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

        <div
          id="more-menu"
          className={styles.menu}
          role="menu"
          hidden={!isOverflowMenuOpen}
        >
          <ul className={styles.menuList}>
            {validChildren.map((child) => (
              // Render cloned child (React elements don't like to be moved around)
              <li role="menuitem" key={child.key}>
                {cloneElement(child)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default OverflowMenu;
