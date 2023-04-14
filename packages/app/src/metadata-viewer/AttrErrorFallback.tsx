import { type FallbackProps } from 'react-error-boundary';

import styles from './MetadataViewer.module.css';

function AttrErrorFallback(props: FallbackProps) {
  const { error } = props;

  return (
    <tr>
      <td className={styles.error}>{error.message}</td>
    </tr>
  );
}

export default AttrErrorFallback;
