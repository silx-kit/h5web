import { type PropsWithChildren, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import styles from './DropZone.module.css';
import { type RemoteFile } from './models';
import UrlForm from './UrlForm';

const EXT = ['.h5', '.hdf5', '.hdf', '.nx', '.nx5', '.nexus', '.nxs', '.cxi'];

interface Props {
  onH5File: (file: File | RemoteFile) => void;
}

function DropZone(props: PropsWithChildren<Props>) {
  const { onH5File, children } = props;

  const onDropAccepted = useCallback(
    ([file]: File[]) => onH5File(file),
    [onH5File],
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
      {...getRootProps({ className: styles.dropZone })}
      data-active={isDragActive || undefined}
    >
      <input {...getInputProps()} accept={EXT.join(',')} />
      {isDragActive && <p className={styles.dropIt}>Drop it!</p>}

      {children ? (
        <div className={styles.h5web}>{children}</div>
      ) : (
        <div className={styles.inner}>
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
          <UrlForm onLoad={onH5File} />
        </div>
      )}
    </div>
  );
}

export default DropZone;
