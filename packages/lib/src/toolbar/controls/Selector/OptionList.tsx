import ram from 'react-aria-menubutton'; // CJS

import type { OptionComponent } from './models';
import styles from './Selector.module.css';

const { MenuItem } = ram;

interface Props<T> {
  optionList: T[];
  optionComponent: OptionComponent<T>;
  value: T;
}

function OptionList<T extends string>(props: Props<T>) {
  const { optionList, optionComponent: Option, value } = props;
  return (
    <ul className={styles.list}>
      {optionList.map((option) => (
        <li key={option}>
          <MenuItem
            className={styles.option}
            text={option}
            value={option}
            data-selected={option === value || undefined}
          >
            <Option option={option} />
          </MenuItem>
        </li>
      ))}
    </ul>
  );
}

export default OptionList;
