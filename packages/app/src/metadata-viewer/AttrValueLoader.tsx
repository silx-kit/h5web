import styles from './MetadataViewer.module.css';

function AttrValueLoader() {
  return (
    <tr>
      <td className={styles.fallback}>Loading...</td>
    </tr>
  );
}

export default AttrValueLoader;
