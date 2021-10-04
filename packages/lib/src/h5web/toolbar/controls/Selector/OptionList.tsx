import { MenuItem } from 'react-aria-menubutton';

import styles from './Selector.module.css';
import type { OptionComponent } from './models';

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
