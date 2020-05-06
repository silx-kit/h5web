import React, { ReactElement } from 'react';
import { FiCamera } from 'react-icons/fi';
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
      <FiCamera />
    </a>
  );
}

export default ScreenshotButton;
