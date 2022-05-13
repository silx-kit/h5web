import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import styles from './H5WasmApp.module.css';
import type { H5File } from './models';

const EXT = ['.h5', '.hdf5', '.hdf', '.nx', '.nx5', '.nexus', '.nxs', '.cxi'];

interface Props {
  onChange: (h5File: H5File) => void;
}

function DropZone(props: Props) {
  const { onChange } = props;
  const [isReadingFile, setReadingFile] = useState(false);

  const onDropAccepted = useCallback(
    ([file]: File[]) => {
      const reader = new FileReader();
      reader.addEventListener('abort', () => setReadingFile(false));
      reader.addEventListener('error', () => setReadingFile(false));
      reader.addEventListener('load', () => {
        onChange({ filename: file.name, buffer: reader.result as ArrayBuffer });
      });

      reader.readAsArrayBuffer(file);
      setReadingFile(true);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, open, isDragActive, fileRejections } =
    useDropzone({
      accept: { 'application/x-hdf5': EXT },
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
      <input {...getInputProps()} />
      <div className={styles.inner}>
        {isDragActive ? (
          <p className={styles.dropIt}>Drop it!</p>
        ) : (
          <>
            <p className={styles.content}>
              Drop an HDF5 file here{' '}
              <button className={styles.btn} type="button" onClick={open}>
                or use a file picker instead
              </button>
            </p>
            <p
              className={styles.hint}
              role={fileRejections.length > 0 ? 'alert' : undefined}
            >
              Extensions allowed: <strong>{EXT.join(' ')}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default DropZone;
