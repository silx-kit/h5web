import { Wrapper, Button, Menu } from 'react-aria-menubutton';

import { MdArrowDropDown } from 'react-icons/md';
import { useWindowSize } from 'react-use';
import type { OptionComponent } from './models';
import OptionList from './OptionList';
import styles from './Selector.module.css';

const MENU_IDEAL_HEIGHT = 320; // 20rem
const MENU_TOP = 87; // HACK: height of breadcrumbs bar + height of toolbar
const MENU_BOTTOM = 16; // offset from bottom of viewport

interface Props<T> {
  label?: string;
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
  options: Record<string, T[]> | T[];
  optionComponent: OptionComponent<T>;
}

function Selector<T extends string>(props: Props<T>) {
  const {
    label,
    value,
    disabled,
    onChange,
    options,
    optionComponent: Option,
  } = props;

  const { height: winHeight } = useWindowSize();
  const menuMaxHeight = winHeight - MENU_TOP - MENU_BOTTOM;

  return (
    <div className={styles.root}>
      {label && <span className={styles.label}>{label}</span>}

      <Wrapper className={styles.wrapper} onSelection={onChange}>
        <Button className={styles.btn} tag="button" disabled={disabled}>
          <div className={styles.btnLike}>
            <span className={styles.selectedOption}>
              <Option option={value} />
            </span>
            <MdArrowDropDown className={styles.arrowIcon} />
          </div>
        </Button>

        <Menu
          className={styles.menu}
          style={{ maxHeight: Math.min(MENU_IDEAL_HEIGHT, menuMaxHeight) }}
        >
          {Array.isArray(options) ? (
            <OptionList
              optionList={options}
              optionComponent={Option}
              value={value}
            />
          ) : (
            <ul className={styles.list}>
              {Object.entries(options).map(([groupLabel, groupOptions]) => (
                <li key={groupLabel}>
                  <span className={styles.groupLabel}>{groupLabel}</span>
                  <ul className={styles.list}>
                    <OptionList
                      optionList={groupOptions}
                      optionComponent={Option}
                      value={value}
                    />
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Menu>
      </Wrapper>
    </div>
  );
}

export default Selector;
