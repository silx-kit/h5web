import { Button, Wrapper, Menu } from 'react-aria-menubutton';
import { FiDownload } from 'react-icons/fi';
import { MdArrowDropDown } from 'react-icons/md';

import styles from './Selector/Selector.module.css';

interface Props<F extends string> {
  formats: F[];
  isSlice: boolean;
  getFormatURL: (format: F) => string | undefined; // `undefined` if format is not supported
}

function ExportMenu<F extends string>(props: Props<F>) {
  const { formats, isSlice, getFormatURL } = props;

  if (!getFormatURL) {
    return null;
  }

  return (
    <Wrapper className={styles.wrapper}>
      <Button className={styles.btn} tag="button">
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
          {formats.map((format) => {
            const url = getFormatURL(format);

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
