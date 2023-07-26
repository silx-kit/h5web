import styles from './RawVis.module.css';

interface Props {
  value: unknown;
}

function RawVis(props: Props) {
  const { value } = props;
  const valueAsStr = JSON.stringify(value, null, 2);

  if (valueAsStr.length > 1000) {
    console.log(value); // eslint-disable-line no-console

    return (
      <div className={styles.fallback}>
        <p className={styles.reason}>Too big to display</p>
        <p className={styles.message}>
          Dataset logged to the browser's developer console instead. Press{' '}
          <kbd>F12</kbd> to open the developer tools and access the console.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <pre className={styles.raw}>{valueAsStr}</pre>
    </div>
  );
}

export default RawVis;
