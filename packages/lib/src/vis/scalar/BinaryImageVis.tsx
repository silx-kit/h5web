import { useLayoutEffect, useState } from 'react';

import { type ClassStyleAttrs } from '../models';
import styles from './BinaryImageVis.module.css';

interface Props extends ClassStyleAttrs {
  value: Uint8Array;
  title?: string;
  fit?: boolean;
}

function BinaryImageVis(props: Props) {
  const { value, title, fit, className = '', style } = props;

  const [src, setSrc] = useState<string>();
  useLayoutEffect(() => {
    setSrc(URL.createObjectURL(new Blob([value.buffer as ArrayBuffer])));
  }, [value]);

  return (
    <div className={`${styles.root} ${className}`} style={style}>
      {src && (
        <img
          className={styles.img}
          src={src}
          alt={title}
          data-keep-colors
          data-fit={fit || undefined}
        />
      )}
    </div>
  );
}

export default BinaryImageVis;
