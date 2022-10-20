import { Button, Wrapper, Menu } from 'react-aria-menubutton';
import { FiDownload } from 'react-icons/fi';
import { MdArrowDropDown } from 'react-icons/md';

import styles from './Selector/Selector.module.css';

export interface ExportEntry {
  format: string;
  url: string | undefined;
}

interface Props {
  entries: ExportEntry[];
  isSlice: boolean;
}

function ExportMenu(props: Props) {
  const { entries, isSlice } = props;

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
      <Menu className={styles.menu}>
        <div className={styles.list}>
          {entries.map(({ format, url }) => {
            return (
              url && (
                <a
                  key={format}
                  className={styles.linkOption}
                  href={url}
                  target="_blank"
                  download={`data.${format}`}
                  rel="noreferrer"
                >
                  <span
                    className={styles.label}
                  >{`Export to ${format.toUpperCase()}`}</span>
                </a>
              )
            );
          })}
        </div>
      </Menu>
    </Wrapper>
  );
}

export default ExportMenu;
