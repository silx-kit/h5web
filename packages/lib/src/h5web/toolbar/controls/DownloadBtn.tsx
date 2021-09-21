import type { AriaAttributes } from 'react';
import type { IconType } from 'react-icons/lib';
import styles from '../Toolbar.module.css';

interface Props extends AriaAttributes {
  label: string;
  icon?: IconType;
  iconOnly?: boolean;
  // If specified, browser will prompt user to download the file instead of opening a new tab
  filename?: string;
  // Invoked on click; must return URL to set as `href`, or `false` to do nothing
  getDownloadUrl: () => string | false;
}

function DownloadBtn(props: Props) {
  const {
    label,
    icon: Icon,
    iconOnly,
    filename,
    getDownloadUrl,
    ...ariaAttrs
  } = props;

  return (
    <a
      className={styles.btn}
      href="/" // placeholder replaced dynamically on click
      target="_blank"
      download={filename}
      aria-label={iconOnly ? label : undefined}
      {...ariaAttrs}
      onClick={(evt) => {
        const url = getDownloadUrl();

        if (url === false) {
          evt.preventDefault();
          return;
        }

        evt.currentTarget.setAttribute('href', url);
      }}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!iconOnly && <span className={styles.label}>{label}</span>}
      </span>
    </a>
  );
}

export default DownloadBtn;
