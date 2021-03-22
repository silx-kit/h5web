import { FiChevronRight } from 'react-icons/fi';
import styles from './BreadcrumbsBar.module.css';

interface Props {
  name: string;
  onClick: () => void;
}

function Crumb(props: Props) {
  const { name, onClick } = props;

  return (
    <>
      <button className={styles.crumbButton} type="button" onClick={onClick}>
        <span className={styles.crumb}>{name}</span>
      </button>
      <FiChevronRight className={styles.separator} title="/" />
    </>
  );
}

export default Crumb;
