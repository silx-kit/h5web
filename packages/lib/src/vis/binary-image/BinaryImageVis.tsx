import { type ClassStyleAttrs } from '../models';
import styles from './BinaryImageVis.module.css';

interface Props extends ClassStyleAttrs {
  value: Uint8Array;
  title?: string;
  fit?: boolean;
}

function BinaryImageVis(props: Props) {
  const { value, title, fit, className = '', style } = props;

  return (
    <div className={`${styles.root} ${className}`} style={style}>
      <img
        className={styles.img}
        src={URL.createObjectURL(new Blob([value]))}
        alt={title}
        data-keep-colors
        data-fit={fit || undefined}
      />
    </div>
  );
}

export default BinaryImageVis;
