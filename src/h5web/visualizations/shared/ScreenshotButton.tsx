import React, { ReactElement } from 'react';
import { MdCameraAlt } from 'react-icons/md';
import styles from './ScreenshotButton.module.css';

function ScreenshotButton(): ReactElement {
  return (
    <a
      className={styles.link}
      href="/"
      target="_blank"
      aria-label="Screenshot"
      onClick={evt => {
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
      <span className={styles.box}>
        <MdCameraAlt className={styles.icon} />
      </span>
    </a>
  );
}

export default ScreenshotButton;
