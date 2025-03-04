import { useCallback, useEffect, useRef, useState } from 'react';

import { type ClassStyleAttrs } from '../models';
import styles from './RawImageVis.module.css';

interface Props extends ClassStyleAttrs {
  value: Uint8Array | Uint8Array[];
  title?: string;
  fit?: boolean;
  // 图像数据流可能单个也可能是数组
  type?: 'single' | 'array';
}

function RawImageVis(props: Props) {
  const { value, title, fit, className = '', style, type } = props;
  const [nowCount, setNowCount] = useState(0);
  const timer = useRef<null | NodeJS.Timeout>(null);

  const handleAuto = useCallback(() => {
    if (timer.current !== null) {
      clearInterval(timer.current);
    }
    timer.current = setInterval(() => {
      setNowCount((prev) => {
        if (prev === (value as Uint8Array[]).length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 500);
  }, [value]);

  useEffect(() => {
    if (type === 'array') {
      handleAuto();
      return () => {
        if (timer.current !== null) {
          clearInterval(timer.current);
        }
      };
    }
    return () => {};
  }, [handleAuto, type]);

  let nowImage = '';
  if (type === 'array') {
    nowImage = URL.createObjectURL(new Blob([value[nowCount] as Uint8Array]));
  } else {
    nowImage = URL.createObjectURL(new Blob([value as Uint8Array]));
  }
  return (
    <div className={`${styles.root} ${className}`} style={style}>
      <div className={styles.imageDiv}>
        <img
          className={styles.img}
          src={nowImage}
          alt={title}
          data-keep-colors
          data-fit={fit || undefined}
        />
      </div>
    </div>
  );
}

export default RawImageVis;
