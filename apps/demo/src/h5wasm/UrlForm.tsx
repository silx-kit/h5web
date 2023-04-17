import useAxios from 'axios-hooks';
import type { FormEvent } from 'react';
import { useCallback, useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

import styles from './H5WasmApp.module.css';
import type { H5File } from './models';

interface Props {
  onH5File: (h5File: H5File) => void;
}

function UrlForm(props: Props) {
  const { onH5File } = props;

  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const url = query.get('url') || '';

  const [{ loading, error }, execute] = useAxios<ArrayBuffer>(
    { url, responseType: 'arraybuffer' },
    { manual: true }
  );

  const fetchFile = useCallback(async () => {
    if (url) {
      const { data } = await execute();
      onH5File({ filename: url.slice(url.lastIndexOf('/') + 1), buffer: data });
    }
  }, [url, execute, onH5File]);

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
      navigate(`?${new URLSearchParams({ url: newUrl }).toString()}`);
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
          {error.isAxiosError
            ? 'Sorry, your file could not be fetched'
            : `An error occured: ${error.message}`}
        </p>
      )}
    </>
  );
}

export default UrlForm;
