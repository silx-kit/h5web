import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import styles from './H5WasmApp.module.css';
import type { H5File } from './models';
import UrlForm from './UrlForm';

const EXT = ['.h5', '.hdf5', '.hdf', '.nx', '.nx5', '.nexus', '.nxs', '.cxi'];

interface Props {
  onH5File: (h5File: H5File) => void;
}

function DropZone(props: Props) {
  const { onH5File } = props;

  const [isReadingFile, setReadingFile] = useState(false);

  const onDropAccepted = useCallback(
    ([file]: File[]) => {
      const reader = new FileReader();
      reader.addEventListener('abort', () => setReadingFile(false));
      reader.addEventListener('error', () => setReadingFile(false));
      reader.addEventListener('load', () => {
        onH5File({ filename: file.name, buffer: reader.result as ArrayBuffer });
      });

      reader.readAsArrayBuffer(file);
      setReadingFile(true);
    },
    [onH5File],
  );

  const { getRootProps, getInputProps, open, isDragActive, fileRejections } =
    useDropzone({
      multiple: false,
      noClick: true,
      noKeyboard: true,
      disabled: isReadingFile,
      onDropAccepted,
    });

  return (
    <div
      {...getRootProps({
        className: isDragActive ? styles.activeDropZone : styles.dropZone,
        'data-disabled': isReadingFile || undefined,
      })}
    >
      <input {...getInputProps()} accept={EXT.join(',')} />
      <div className={styles.inner}>
        {isDragActive && <p className={styles.dropIt}>Drop it!</p>}
        <div hidden={isDragActive}>
          <p className={styles.drop}>
            <span>Drop an HDF5 file here</span>{' '}
            <button className={styles.browseBtn} type="button" onClick={open}>
              or use a file picker instead
            </button>
          </p>
          {fileRejections.length > 1 && (
            <p className={styles.hint} role="alert">
              Please drop a single file
            </p>
          )}
          <p className={styles.fromUrl}>
            You may also provide a URL if your file is hosted remotely:
          </p>
          <UrlForm onH5File={onH5File} />
        </div>
      </div>
    </div>
  );
}

export default DropZone;
