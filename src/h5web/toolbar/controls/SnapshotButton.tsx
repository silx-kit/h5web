import type { ReactElement } from 'react';
import { MdCameraAlt } from 'react-icons/md';
import styles from './SnapshotButton.module.css';

interface Props {
  disabled?: boolean;
}

function SnapshotButton(props: Props): ReactElement {
  const { disabled } = props;

  return (
    <a
      className={styles.link}
      href="/"
      target="_blank"
      aria-label="Snapshot"
      aria-disabled={disabled ? 'true' : undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={(evt) => {
        const canvas = document.querySelector('canvas');

        // Create data URL from canvas
        const screnshotUrl = canvas?.toDataURL();

        if (screnshotUrl) {
          // Let link open screenshot URL in new tab/window
          evt.currentTarget.setAttribute('href', screnshotUrl);
        } else {
          // Don't follow link if canvas hasn't been rendered yet
          evt.preventDefault();
        }
      }}
    >
      <span className={styles.btnLike}>
        <MdCameraAlt className={styles.icon} />
        <span className={styles.label}>Snapshot</span>
      </span>
    </a>
  );
}

export default SnapshotButton;
