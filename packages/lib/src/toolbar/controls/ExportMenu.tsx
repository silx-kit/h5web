import { Menu, MenuButton, MenuItem, MenuProvider } from '@ariakit/react';
import { FiDownload } from 'react-icons/fi';
import { MdArrowDropDown } from 'react-icons/md';

import type { ExportEntryProps } from './ExportEntry';
import ExportEntry from './ExportEntry';
import styles from './Selector/Selector.module.css';

const PLACEMENTS = {
  center: 'bottom',
  left: 'bottom-start',
  right: 'bottom-end',
} as const;

interface Props {
  entries: ExportEntryProps[];
  isSlice?: boolean;
  align?: keyof typeof PLACEMENTS;
}

function ExportMenu(props: Props) {
  const { entries, isSlice, align = 'center' } = props;

  return (
    <MenuProvider placement={PLACEMENTS[align]}>
      <MenuButton
        className={styles.btn}
        disabled={!entries.some(({ url }) => !!url)}
      >
        <div className={styles.btnLike}>
          <FiDownload className={styles.icon} />
          <span className={styles.selectedOption}>
            Export{isSlice && ' slice'}
          </span>
          <MdArrowDropDown className={styles.arrowIcon} />
        </div>
      </MenuButton>
      <Menu className={styles.exportMenu}>
        {entries.map((entry) => (
          <MenuItem key={entry.format} render={<ExportEntry {...entry} />} />
        ))}
      </Menu>
    </MenuProvider>
  );
}

export default ExportMenu;
