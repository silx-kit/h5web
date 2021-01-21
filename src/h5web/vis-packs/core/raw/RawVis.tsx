import type { ReactElement } from 'react';
import styles from './RawVis.module.css';
import type { HDF5Value } from '../../../providers/hdf5-models';

interface Props {
  value: HDF5Value;
}

function RawVis(props: Props): ReactElement {
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
