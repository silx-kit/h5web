import ram from 'react-aria-menubutton'; // CJS
import { FiDownload } from 'react-icons/fi';
import { MdArrowDropDown } from 'react-icons/md';

import type { ExportEntryProps } from './ExportEntry';
import ExportEntry from './ExportEntry';
import styles from './Selector/Selector.module.css';

const { Button, Menu, Wrapper } = ram;

interface Props {
  entries: ExportEntryProps[];
  isSlice?: boolean;
  align?: 'center' | 'left' | 'right';
}

function ExportMenu(props: Props) {
  const { entries, isSlice, align = 'center' } = props;

  return (
    <Wrapper className={styles.wrapper}>
      <Button
        className={styles.btn}
        tag="button"
        disabled={!entries.some(({ url }) => !!url)}
      >
        <div className={styles.btnLike}>
          <FiDownload className={styles.icon} />
          <span className={styles.selectedOption}>
            Export{isSlice && ' slice'}
          </span>
          <MdArrowDropDown className={styles.arrowIcon} />
        </div>
      </Button>
      <Menu className={styles.menu} data-align={align}>
        <div className={styles.list}>
          {entries.map((entry) => (
            <ExportEntry key={entry.format} {...entry} />
          ))}
        </div>
      </Menu>
    </Wrapper>
  );
}

export default ExportMenu;
