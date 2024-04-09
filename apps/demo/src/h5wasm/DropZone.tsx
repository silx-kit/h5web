import type { PropsWithChildren } from 'react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import styles from './H5WasmApp.module.css';

const EXT = ['.h5', '.hdf5', '.hdf', '.nx', '.nx5', '.nexus', '.nxs', '.cxi'];

interface Props {
  onDrop: (file: File) => void;
}

function DropZone(props: PropsWithChildren<Props>) {
  const { onDrop, children } = props;

  const onDropAccepted = useCallback(
    ([file]: File[]) => onDrop(file),
    [onDrop],
  );

  const { getRootProps, getInputProps, open, isDragActive, fileRejections } =
    useDropzone({
      multiple: false,
      noClick: true,
      noKeyboard: true,
      onDropAccepted,
    });

  return (
    <div
      {...getRootProps({
        className: isDragActive ? styles.activeDropZone : styles.dropZone,
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
          {children}
        </div>
      </div>
    </div>
  );
}

export default DropZone;
