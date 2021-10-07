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
      <p className={styles.fallback}>
        The dataset is too big to be displayed and was logged to the console
        instead.
      </p>
    );
  }

  return <pre className={styles.raw}>{valueAsStr}</pre>;
}

export default RawVis;
