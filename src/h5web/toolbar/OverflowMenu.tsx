import { ReactElement, useRef, Children, cloneElement } from 'react';
import { FiMenu } from 'react-icons/fi';
import { useToggle } from '@react-hookz/web';
import { useClickAway } from 'react-use';
import Separator from './Separator';
import styles from './OverflowMenu.module.css';

interface Props {
  children: ReactElement[];
}

function OverflowMenu(props: Props) {
  const { children } = props;

  const rootRef = useRef(null);
  const [isOverflowMenuOpen, toggleOverflowMenu] = useToggle(false);

  useClickAway(
    rootRef,
    () => {
      if (isOverflowMenuOpen) {
        toggleOverflowMenu(false); // force close in case menu button was clicked
      }
    },
    ['click']
  );

  if (children.length === 0) {
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
          onClick={() => toggleOverflowMenu()}
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
            {Children.map(children, (child) => (
              // Render cloned child (React elements don't like to be moved around)
              <li role="menuitem">{cloneElement(child)}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default OverflowMenu;
