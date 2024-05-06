import { Btn } from '@h5web/lib';
import { FiZap } from 'react-icons/fi';

import styles from './PrefetchBtn.module.css';

interface Props {
  onClick: () => void;
}

function PrefetchBtn(props: Props) {
  const { onClick } = props;
  return (
    <Btn
      className={styles.prefetchBtn}
      icon={FiZap}
      iconOnly
      label="Load entire dimension"
      onClick={() => onClick()}
    />
  );
}

export default PrefetchBtn;
