import styles from './Selector/Selector.module.css';

interface Props {
  format: string;
  url: URL | (() => Promise<URL | Blob>) | undefined;
}

function ExportEntry(props: Props) {
  const { format, url } = props;
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

  if (url instanceof URL) {
    return (
      <a
        className={styles.linkOption}
        href={url.href}
        target="_blank"
        download={filename}
        rel="noreferrer"
      >
        <span className={styles.label}>{label}</span>
      </a>
    );
  }

  if (typeof url === 'function') {
    return (
      <button
        className={styles.linkOption}
        type="button"
        onClick={() => void handleBtnClick(url)}
      >
        <span className={styles.label}>{label}</span>
      </button>
    );
  }

  return null;
}

export type { Props as ExportEntryProps };
export default ExportEntry;
