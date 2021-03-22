import { MdCameraAlt } from 'react-icons/md';
import styles from './SnapshotButton.module.css';

function SnapshotButton() {
  return (
    <a
      className={styles.link}
      href="/"
      target="_blank"
      aria-label="Snapshot"
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
