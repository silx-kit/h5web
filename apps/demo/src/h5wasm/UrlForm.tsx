import { type SubmitEvent, useCallback, useEffect, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { useSearchParams } from 'wouter';

import { type RemoteFile } from './models';
import styles from './UrlForm.module.css';

interface Props {
  onLoad: (h5File: RemoteFile) => void;
}

function UrlForm(props: Props) {
  const { onLoad } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const url = searchParams.get('url') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const checkFile = useCallback(
    async (signal: AbortSignal) => {
      if (!url) {
        return;
      }

      setLoading(true);
      setError(undefined);

      try {
        await checkUrl(url, signal);
        if (!signal.aborted) {
          onLoad({ url }); // file is then read lazily with HTTP range requests, when supported
        }
      } catch (error_) {
        if (!signal.aborted) {
          setError(error_);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [url, onLoad],
  );

  useEffect(() => {
    const controller = new AbortController();
    void checkFile(controller.signal);
    return () => controller.abort();
  }, [checkFile]);

  function handleUrlSubmit(evt: SubmitEvent) {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const newUrl = formData.get('url') as string;

    if (newUrl === url) {
      void checkFile(new AbortController().signal); // retry
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
          Sorry, your file could not be fetched
          {error instanceof Error && `: ${error.message}`}
        </p>
      )}
    </>
  );
}

/* Check that the file can be fetched before passing its URL to the provider,
 * so errors can be reported here. Only the response headers are awaited. */
async function checkUrl(url: string, signal: AbortSignal): Promise<void> {
  const response = await fetch(url, { signal });
  await response.body?.cancel();

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
}

export default UrlForm;
