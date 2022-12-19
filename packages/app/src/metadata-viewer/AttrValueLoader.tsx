import styles from './MetadataViewer.module.css';

function AttrValueLoader() {
  return (
    <tr data-testid="LoadingAttributes">
      <td className={styles.fallback}>Loading...</td>
    </tr>
  );
}

export default AttrValueLoader;
