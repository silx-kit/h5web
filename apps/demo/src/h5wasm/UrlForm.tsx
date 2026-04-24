import { createBasicFetcher } from '@h5web/app';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { useSearchParams } from 'wouter';

import { FetcherError } from '../../../../packages/app/src/providers/utils';
import { type RemoteFile } from './models';
import styles from './UrlForm.module.css';

const fetcher = createBasicFetcher();

interface Props {
  onLoad: (h5File: RemoteFile) => void;
}

function UrlForm(props: Props) {
  const { onLoad } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const url = searchParams.get('url') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const fetchFile = useCallback(async () => {
    if (!url) {
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const buffer = await fetcher(url, {});
      onLoad({
        filename: url.slice(url.lastIndexOf('/') + 1),
        buffer,
      });
    } catch (error_) {
      setError(error_);
    } finally {
      setLoading(false);
    }
  }, [url, onLoad]);

  useEffect(() => {
    void fetchFile();
  }, [url, fetchFile]);

  function handleUrlSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const newUrl = formData.get('url') as string;

    if (newUrl === url) {
      void fetchFile(); // refetch
    } else {
      setSearchParams((prev) => {
        prev.set('url', newUrl);
        return prev;
      });
    }
  }

  // Make sure loading state appears on first render if appropriate
  const isLoading = loading || (!!url && !error);

  return (
    <>
      <form className={styles.urlForm} onSubmit={handleUrlSubmit}>
        <fieldset disabled={isLoading}>
          <input
            className={styles.urlInput}
            name="url"
            type="url"
            defaultValue={url}
            placeholder="https://example.com/my-file.h5"
            aria-labelledby="h5wasm-url"
            required
          />
          <button id="h5wasm-url" className={styles.urlBtn} type="submit">
            {isLoading ? (
              <FiLoader className={styles.urlLoader} aria-label="Loading..." />
            ) : (
              'Go'
            )}
          </button>
        </fieldset>
      </form>
      {error && (
        <p className={styles.hint} role="alert">
          {error instanceof FetcherError
            ? 'Sorry, your file could not be fetched'
            : `An error occured${error instanceof Error ? `: ${error.message}` : ''}`}
        </p>
      )}
    </>
  );
}

export default UrlForm;
