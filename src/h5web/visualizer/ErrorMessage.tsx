import styles from './Visualizer.module.css';

interface Props {
  error: Error;
}

function ErrorMessage(props: Props) {
  const { error } = props;
  return <p className={styles.error}>{error.message}</p>;
}

export default ErrorMessage;
