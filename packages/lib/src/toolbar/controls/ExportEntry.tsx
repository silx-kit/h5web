import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import styles from './Selector/Selector.module.css';

interface Props extends HTMLAttributes<HTMLButtonElement> {
  format: string;
  url: URL | (() => Promise<URL | Blob>) | undefined;
}

// https://ariakit.org/guide/coding-guidelines#name-functions-inside-forwardref
const ExportEntry = forwardRef<HTMLButtonElement, Props>(
  // eslint-disable-next-line prefer-arrow-callback
  function ExportEntry(props, ref) {
    const { format, url, ...htmlProps } = props;
    const label = `Export to ${format.toUpperCase()}`;
    const filename = `data.${format}`;

    async function handleBtnClick(getURLOrBlob: () => Promise<URL | Blob>) {
      const urlOrBlob = await getURLOrBlob();

      /* Because `getURLOrBlob` is async, we can't rely on the browser's default click action
       * to start the download. We have to create a dummy anchor element, add it to the DOM
       * and click on it programmatically. */
      const anchor = document.createElement('a');
      anchor.download = filename;
      document.body.append(anchor);

      if (urlOrBlob instanceof Blob) {
        const blobUrl = URL.createObjectURL(urlOrBlob);
        anchor.href = blobUrl;
        anchor.click();
        URL.revokeObjectURL(blobUrl);
      } else {
        anchor.href = urlOrBlob.href;
        anchor.click();
      }

      anchor.remove();
    }

    if (!url) {
      return null;
    }

    return (
      <button
        {...htmlProps}
        ref={ref}
        className={styles.linkOption}
        type="button"
        onClick={() => {
          void handleBtnClick(url instanceof URL ? async () => url : url);
        }}
      >
        <span className={styles.label}>{label}</span>
      </button>
    );
  },
);

export type { Props as ExportEntryProps };
export default ExportEntry;
